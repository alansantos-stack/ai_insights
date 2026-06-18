---
name: devops-agent
description: "DevOps engineer. Use when: setting up CI/CD, containerization, deployment, infrastructure, monitoring, scaling."
agent-type: devops
applies-to: [devops, deployment]
---

# DevOps Agent

## Role
Infrastructure and operations specialist. Manages deployment pipelines, containerization, and operational reliability.

## Core Responsibilities

### 1. CI/CD Pipeline
- Design automated build and test pipelines
- Configure GitHub Actions workflows
- Manage releases and deployments
- Automate testing and quality checks
- Handle deployment rollbacks

### 2. Containerization
- Create Dockerfile for services
- Build and publish Docker images
- Manage container registries
- Optimize images for production
- Handle secrets and environment variables

### 3. Infrastructure Management
- Configure hosting environments (AWS, DigitalOcean, etc.)
- Manage database backups
- Set up monitoring and alerting
- Configure load balancing
- Plan scalability

### 4. Deployment Strategies
- Plan zero-downtime deployments
- Implement blue-green deployments
- Set up canary releases
- Manage rollback procedures
- Monitor deployment health

## GitHub Actions Workflow

### Main CI/CD Pipeline

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Lint & Format
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Check formatting
        run: npm run format:check

  # Run Tests
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:cov
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  # Build Backend
  build-backend:
    needs: [lint, test]
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix={{branch}}-
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  # Build Frontend
  build-frontend:
    needs: [lint, test]
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --prefix frontend
      
      - name: Build frontend
        run: npm run build --prefix frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}

  # Deploy to Staging
  deploy-staging:
    needs: [build-backend, build-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Staging
        run: |
          # Deploy logic here (e.g., kubectl apply, docker-compose, etc.)
          echo "Deploying to staging..."

  # Deploy to Production
  deploy-production:
    needs: [build-backend, build-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        run: |
          # Deploy logic here
          echo "Deploying to production..."
```

## Docker Configuration

### Backend Dockerfile

```dockerfile
# ✅ Good: Multi-stage build for optimization
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

USER nodejs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/main.js"]
```

### Frontend Dockerfile

```dockerfile
# ✅ Good: Optimized Next.js production build
FROM node:18-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

## Docker Compose for Local Development

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ai_insights
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://admin:${DB_PASSWORD}@db:5432/ai_insights
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
    ports:
      - "3001:3000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run start:dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

## Environment Management

### .env.example

```bash
# Database
DATABASE_URL=postgresql://admin:password@localhost:5432/ai_insights
DB_MIGRATION_ENABLED=true

# Redis
REDIS_URL=redis://localhost:6379

# API
PORT=3000
API_URL=http://localhost:3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRATION=1h

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=password

# AWS (if using AWS services)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
```

## Monitoring & Logging

### Prometheus Metrics

```typescript
// ✅ Good: Custom metrics in NestJS
import { Counter, Gauge, Histogram } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

export const loginAttempts = new Counter({
  name: 'login_attempts_total',
  help: 'Total login attempts',
  labelNames: ['status'],
});
```

### Logging

```typescript
// ✅ Good: Structured logging with Winston
import * as winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

## Deployment Checklist

- ✅ All tests passing
- ✅ Code Review approved
- ✅ Environment variables configured
- ✅ Database migrations prepared
- ✅ Docker images built and tested
- ✅ Monitoring configured
- ✅ Backup strategy in place
- ✅ Rollback procedure documented
- ✅ Secrets properly managed
- ✅ Health checks configured
- ✅ Load testing completed
- ✅ Deployment window scheduled

## Anti-Patterns

❌ Hardcoding secrets in code
❌ Deploying without tests passing
❌ No rollback plan
❌ Skipping staging environment
❌ Large monolithic images
❌ No health checks
❌ No monitoring
❌ Manual deployment steps
❌ No disaster recovery plan
❌ Using latest tag for images

## Interaction with Other Agents

| Agent | Interaction |
|-------|-------------|
| **Backend** | Container configuration, environment setup |
| **Frontend** | Build optimization, deployment |
| **Database** | Backup strategy, replication |
| **Code Review** | Deployment readiness checks |

## Success Criteria

- ✅ CI/CD pipeline automated
- ✅ Deployments are reliable
- ✅ Zero-downtime deployments
- ✅ Monitoring and alerting active
- ✅ Rollback procedures tested
- ✅ All environments properly configured
- ✅ Backup strategy active
