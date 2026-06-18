# security-scan

Scan the project for security vulnerabilities: hardcoded secrets, vulnerable dependencies, and insecure patterns.

## When to use
Use periodically (before releases) or when dependency alerts appear. Can be run on the whole codebase or a specific directory.

## Instructions

You are acting as the **Security Agent** for the AI Insights project.

Perform a comprehensive security scan across all layers:

### 1. Dependency Vulnerability Scan
```bash
# Run these and report findings
cd backend && npm audit --json
cd frontend && npm audit --json
```

For each vulnerability found, report:
| Package | Severity | CVSS | Description | Fix |
|---------|----------|------|-------------|-----|
| <package>@<version> | Critical/High | X.X | <description> | Upgrade to <version> |

Prioritize: Critical → High → Moderate (ignore Low unless trivial to fix).

### 2. Hardcoded Secrets Scan
Search for common secret patterns in the codebase:
```bash
# Patterns to check for
grep -rn "password\s*=\s*['\"]" --include="*.ts" src/
grep -rn "secret\s*=\s*['\"]" --include="*.ts" src/
grep -rn "api_key\s*=\s*['\"]" --include="*.ts" src/
grep -rn "Bearer [A-Za-z0-9]" --include="*.ts" src/
```

Flag any hardcoded credentials and provide the fix (use `ConfigService` / env vars).

### 3. Insecure Code Pattern Scan
Check for known anti-patterns:

**Injection risks:**
- `queryRunner.query(\`...${variable}...\`)` — raw SQL with interpolation
- `eval(` — dynamic code execution
- `innerHTML =` or `dangerouslySetInnerHTML` in React

**Insecure auth patterns:**
- `if (req.query.admin === 'true')` — trusting user input for auth
- JWT without expiry (`expiresIn` not set)
- MD5/SHA1 for password hashing (must be bcrypt)

**Data exposure:**
- `return user` from controller without omitting `passwordHash`
- Logging `password`, `token`, `creditCard`, `ssn` fields
- Error messages revealing internal details (`stackTrace` in response)

**Missing security headers:**
- `app.use(helmet())` not present in `main.ts`
- CORS not configured or using `origin: '*'`

### 4. Environment Variables Audit
Check `.env.example` and `main.ts` for:
- All secrets use environment variables
- Required vars have validation at startup
- No default values for security-critical vars (JWT_SECRET, DB_PASSWORD)

```typescript
// Good pattern in main.ts
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}
```

### 5. Scan Report

```
## Security Scan Report
**Date**: <today>
**Scope**: <backend | frontend | full>

### Critical Findings (fix immediately)
...

### High Findings (fix before next release)
...

### Moderate Findings (fix in next sprint)
...

### Passed Checks
- [ ] No hardcoded secrets found
- [ ] All dependencies up to date
- [ ] Security headers configured
- [ ] CORS properly restricted
```
