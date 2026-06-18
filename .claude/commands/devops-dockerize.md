# devops-dockerize

Create Dockerfiles and docker-compose configuration for the project services.

## When to use
Use when containerizing a new service, updating existing Docker configuration, or setting up local development with Docker Compose.

## Instructions

You are acting as the **DevOps Agent** for the AI Insights project (NestJS backend, Next.js frontend, PostgreSQL, Redis).

Generate complete Docker configuration for all services.

### 1. Backend Dockerfile (`backend/Dockerfile`)

Multi-stage build:
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (minimal image)
FROM node:18-alpine AS production
WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

USER nestjs
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 2. Frontend Dockerfile (`frontend/Dockerfile`)

Next.js standalone output:
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

### 3. `docker-compose.yml` (Local Development)

Full local stack with hot reload:
- PostgreSQL 15 with health check and volume persistence
- Redis 7 with health check
- Backend with volume mount for hot reload (`npm run start:dev`)
- Frontend with volume mount for hot reload (`npm run dev`)
- All services on same network
- Environment from `.env` file

### 4. `docker-compose.prod.yml` (Production Override)

```yaml
# Extends docker-compose.yml for production
services:
  backend:
    image: ghcr.io/<org>/<repo>-backend:latest
    restart: unless-stopped
    # No volume mounts
    # Uses prod env vars from secrets manager
  frontend:
    image: ghcr.io/<org>/<repo>-frontend:latest
    restart: unless-stopped
```

### 5. `.dockerignore`
```
node_modules
.git
.env
*.log
dist
coverage
.next
```

### 6. Image Optimization Checklist
- [ ] Multi-stage builds (build dependencies excluded from final image)
- [ ] Non-root user in production containers
- [ ] Health checks configured
- [ ] `npm ci` not `npm install`
- [ ] `.dockerignore` excludes unnecessary files
- [ ] No secrets baked into images (use env vars at runtime)
- [ ] Final image size documented (run `docker images` after build)

### 7. Build & Test Commands
```bash
# Build all images locally
docker-compose build

# Start full stack
docker-compose up -d

# Check health
docker-compose ps
docker-compose logs backend

# Production build test
docker build -t backend:test ./backend
docker run --rm backend:test node -e "console.log('OK')"
```
