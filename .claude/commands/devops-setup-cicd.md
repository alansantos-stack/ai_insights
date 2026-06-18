# devops-setup-cicd

Create or update the GitHub Actions CI/CD pipeline for the project.

## When to use
Use when setting up a new pipeline, adding a new job, or when CI/CD is broken. Provide the desired pipeline behavior.

## Instructions

You are acting as the **DevOps Agent** for the AI Insights project (GitHub Actions, Docker, Node.js 18).

Generate a complete GitHub Actions workflow configuration for `.github/workflows/`.

### Pipeline Structure

Create separate workflow files for clarity:

#### 1. `.github/workflows/ci.yml` — Pull Request Checks
Runs on every PR to `main` and `develop`:
```yaml
name: CI
on:
  pull_request:
    branches: [main, develop]

jobs:
  lint:       # ESLint + Prettier check
  test:       # Unit tests + coverage (with PostgreSQL service container)
  build:      # TypeScript compilation check
  security:   # npm audit --audit-level=moderate
```

#### 2. `.github/workflows/cd.yml` — Deployment
Runs on push to `develop` (staging) and `main` (production):
```yaml
name: CD
on:
  push:
    branches: [main, develop]

jobs:
  build-backend:     # Docker build + push to GHCR
  build-frontend:    # Next.js build + Docker push
  deploy-staging:    # Deploy to staging (on develop push)
  deploy-production: # Deploy to production (on main push, requires approval)
```

### Required Workflow Features

**Test job must have:**
- PostgreSQL 15 service container with health check
- `npm ci` (not `npm install`) for reproducible installs
- Coverage upload to CodeCov
- Fail if coverage < 80%

**Build job must have:**
- Docker multi-stage build
- Image tagged with: `branch-sha`, `branch-latest`, semver (on tags)
- Push to GitHub Container Registry (GHCR)
- Build cache using `actions/cache`

**Deploy job must have:**
- `environment:` protection rules (staging/production)
- Database migration step before app update
- Health check after deployment
- Rollback trigger on failure

**Security job:**
```yaml
- name: Dependency audit
  run: |
    cd backend && npm audit --audit-level=moderate
    cd ../frontend && npm audit --audit-level=moderate
```

### Secrets Required
Document which GitHub Secrets must be configured:
```
GHCR_TOKEN         # GitHub Container Registry auth
STAGING_HOST       # SSH host for staging server
PRODUCTION_HOST    # SSH host for production server
CODECOV_TOKEN      # Coverage reporting
DB_MIGRATION_URL   # Database URL for running migrations
```

### Environment Variables in Workflows
```yaml
env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

### Workflow Optimization
- Use `concurrency` to cancel in-progress runs on new push
- Separate jobs for backend and frontend (run in parallel)
- Cache `node_modules` between jobs using `actions/cache`
- Use `needs:` to enforce job ordering only where necessary
