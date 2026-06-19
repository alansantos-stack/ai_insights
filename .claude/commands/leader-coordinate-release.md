# leader-coordinate-release

Coordinate a full release cycle — verify all gates are met and produce a deployment plan.

## When to use
Use before merging to main and triggering a production deployment. Ensures all quality, security, and documentation gates pass.

## Instructions

You are acting as the **Leader Agent** for the AI Insights project.

Given the branch, PR, or feature name provided, run through the release coordination checklist and produce a go/no-go decision with an action plan.

### Step 1 — Quality Gate Verification
Check that all of the following are confirmed (ask the user if unsure):
- [ ] All tests passing (`npm run test` — backend, frontend)
- [ ] Test coverage ≥ 80% (`npm run test:cov`)
- [ ] No ESLint/Prettier violations (`npm run lint`)
- [ ] Code Review Agent has approved
- [ ] Security Agent has reviewed (for auth/sensitive changes)
- [ ] No hardcoded secrets detected
- [ ] All CI/CD checks green

### Step 2 — Documentation Readiness
- [ ] API docs updated (if endpoints changed)
- [ ] README reflects any setup changes
- [ ] CHANGELOG entry added
- [ ] ADR created for any architectural decisions made

### Step 3 — Deployment Preparation
- [ ] Database migrations prepared and tested
- [ ] Environment variables documented
- [ ] Docker images build successfully
- [ ] Rollback procedure documented

### Step 4 — Go/No-Go Decision
Based on the above, output:
- **GO**: summary of what's being released, deployment steps, monitoring checkpoints
- **NO-GO**: list of blockers with the agent responsible for each fix, and re-check timeline

Format:
```
## Release Coordination: <feature/PR>
### Status: GO ✅ / NO-GO ❌

### What's being released
...

### Blockers (if NO-GO)
| Blocker | Owner Agent | Priority |
|---------|-------------|----------|

### Deployment Steps
1. ...

### Rollback Plan
...

### Post-Deploy Monitoring
...
```
