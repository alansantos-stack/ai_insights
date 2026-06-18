# devops-deploy-check

Validate deployment readiness and produce a deployment runbook for a release.

## When to use
Use before triggering any deployment — staging or production. Provide the PR/branch/version being deployed.

## Instructions

You are acting as the **DevOps Agent** for the AI Insights project.

Given the release details, run through all deployment gates and produce a go/no-go decision with a complete runbook.

### Pre-Deployment Checklist

#### Code Quality
- [ ] All CI checks green (lint, tests, build)
- [ ] Test coverage ≥ 80% confirmed
- [ ] Code Review Agent approved
- [ ] Security Agent cleared (for auth/sensitive changes)
- [ ] No `console.log` in production code
- [ ] No hardcoded secrets

#### Database
- [ ] Migrations written and reviewed
- [ ] Migrations tested on a copy of staging DB
- [ ] Rollback migration exists
- [ ] Estimated migration runtime (flag if > 30s for zero-downtime concern)
- [ ] No destructive schema changes without data backfill confirmed

#### Infrastructure
- [ ] Docker images build successfully
- [ ] Image tags pinned (not `latest`)
- [ ] Environment variables set in deployment environment
- [ ] Secrets updated if changed
- [ ] Health check endpoints respond correctly

#### Monitoring
- [ ] Metrics dashboard accessible
- [ ] Alerts configured for error rate spike
- [ ] Log aggregation working

### Deployment Runbook

```markdown
## Deployment Runbook: v<X.X.X> — <feature name>
**Date**: <today>
**Engineer**: DevOps Agent
**Environment**: Staging / Production

### Pre-Deployment (T-30min)
1. Notify team in channel: "Deploying v<X> to <env> at <time>"
2. Verify current production health: `curl https://api.<domain>/health`
3. Create database backup: `<backup command>`

### Deployment Steps
1. Run database migration:
   \`\`\`bash
   docker exec backend npm run typeorm migration:run
   \`\`\`
   Expected output: `<migration name> has been executed`
   
2. Deploy backend:
   \`\`\`bash
   docker pull ghcr.io/<org>/ai-insights-backend:<tag>
   docker-compose -f docker-compose.prod.yml up -d backend
   \`\`\`
   Wait for health check: 30 seconds

3. Deploy frontend:
   \`\`\`bash
   docker pull ghcr.io/<org>/ai-insights-frontend:<tag>
   docker-compose -f docker-compose.prod.yml up -d frontend
   \`\`\`

### Verification (T+5min)
- [ ] `curl https://api.<domain>/health` returns 200
- [ ] `curl https://<domain>` loads correctly
- [ ] Check error rate in monitoring dashboard
- [ ] Smoke test: <specific user action to verify feature>

### Rollback Procedure
If any verification fails:
1. `docker-compose -f docker-compose.prod.yml up -d backend:<previous-tag>`
2. If DB migration ran: `npm run typeorm migration:revert`
3. Notify team: "Rolling back v<X> due to: <reason>"

### Post-Deployment (T+30min)
- [ ] Monitor error rates for 30 minutes
- [ ] Confirm no performance degradation
- [ ] Update CHANGELOG if not done
- [ ] Close deployment issue/ticket
```

### Verdict
**GO** ✅ / **NO-GO** ❌

Blockers (if NO-GO):
| Blocker | Owner | ETA |
|---------|-------|-----|
