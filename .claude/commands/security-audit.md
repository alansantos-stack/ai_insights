# security-audit

Perform an OWASP Top 10 security review on a feature, module, or PR.

## When to use
Use before merging any code that touches authentication, authorization, data handling, or external inputs. Provide the file path(s) or PR description.

## Instructions

You are acting as the **Security Agent** for the AI Insights project.

Given the code to review, perform a structured OWASP Top 10 security audit:

### OWASP Top 10 Checks

For each category, status: ✅ No issue / ⚠️ Warning / ❌ Vulnerability

**A01 — Broken Access Control**
- Every endpoint has auth guard (`@UseGuards(JwtAuthGuard)`) or is intentionally public
- Resource ownership verified (user can only access their own data)
- No direct object references without ownership check

**A02 — Cryptographic Failures**
- Passwords hashed with bcrypt (≥10 rounds), never stored plain
- Sensitive data encrypted at rest (if applicable)
- No sensitive data in URLs, logs, or error messages
- HTTPS enforced in production config

**A03 — Injection**
- No raw SQL string concatenation — TypeORM parameterized queries only
- Input sanitized before use
- No `eval()` or dynamic code execution

**A04 — Insecure Design**
- Rate limiting on auth endpoints
- Account lockout after failed attempts (if implemented)
- Password reset flow uses short-lived tokens

**A05 — Security Misconfiguration**
- CORS restricted to known origins (not `*`)
- Security headers set (helmet)
- Error responses don't expose stack traces or internal details
- No debug endpoints in production

**A06 — Vulnerable Dependencies**
```bash
npm audit --audit-level=moderate
```
Flag any moderate+ severity findings.

**A07 — Authentication Failures**
- JWT tokens expire (≤1h for access, ≤7d for refresh)
- Token validation errors handled uniformly (no info leak)
- Session invalidation on logout

**A08 — Software and Data Integrity**
- DTOs validate all inputs with class-validator
- Zod/class-validator on frontend forms
- No unsafe deserialization

**A09 — Logging & Monitoring Failures**
- Auth failures logged (email, timestamp — NOT password)
- Unauthorized access attempts logged
- No sensitive data (passwords, tokens, PII) in logs

**A10 — SSRF**
- Any external URL fetching validates against whitelist
- Internal IPs/localhost blocked

### Output Format

```
## Security Audit: <feature/file>
**Date**: <today>
**Auditor**: Security Agent

### Findings
| # | Category | Severity | Description | File:Line |
|---|----------|----------|-------------|-----------|
| 1 | A01 | Critical | Missing auth on /users/:id DELETE | controller.ts:45 |

### Critical Issues (block merge)
<detailed description + fix>

### Warnings (fix before next release)
...

### Recommendations (improvements)
...

### Verdict: APPROVED / BLOCKED
**Conditions for approval** (if BLOCKED):
- Fix #1: ...
```
