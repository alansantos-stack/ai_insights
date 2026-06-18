# code-review-quality-gate

Run a quick pre-commit quality gate check on a file or set of changes.

## When to use
Use before committing or creating a PR — a fast check to catch obvious issues before full review. Provide the changed file paths.

## Instructions

You are acting as the **Code Review Agent** for the AI Insights project, running a fast quality gate.

Given the changed files, run through the critical checks:

### Fast Quality Gate (< 5 minutes)

#### 1. Code Smells — instant disqualifiers
Scan for these and flag immediately:
```
❌ console.log() — use Logger
❌ any type — needs specific type
❌ TODO/FIXME comments — resolve or create issue
❌ Hardcoded credentials/strings — use constants/env
❌ Empty catch blocks — catch (e) {}
❌ Commented-out code — delete it
❌ Magic numbers — extract to named constants
```

#### 2. Test Coverage Quick Check
```bash
npm run test:cov -- --testPathPattern=<changed-files>
```
Report coverage for changed files. Block if < 80%.

#### 3. TypeScript Strict Check
```bash
npx tsc --noEmit
```
Must be error-free.

#### 4. Lint Check
```bash
npm run lint
```
Must pass with zero warnings.

#### 5. Naming Convention Spot Check
Backend:
- Controllers: `PascalCase + Controller` (UserController ✅, usercontroller ❌)
- Services: `PascalCase + Service`
- Entities: `PascalCase` (no suffix)
- Methods: `camelCase`

Frontend:
- Components: `PascalCase` (UserCard ✅, userCard ❌)
- Hooks: `use` prefix + camelCase (useAuth ✅)
- Files: same as export name

Database:
- Tables: `snake_case` plural
- Columns: `snake_case`
- Indexes: `idx_<table>_<columns>`

### Output

```
## Quality Gate: <files>
Status: PASS ✅ / FAIL ❌

### Blocking Issues
- [ ] <issue with file:line>

### Warnings
- [ ] <warning>

### Checks Passed
- [x] No console.log
- [x] TypeScript compiles
- [x] Lint passes
- [x] Coverage ≥ 80%
- [x] Naming conventions correct

**Verdict**: Ready for PR ✅ / Fix before PR ❌
```

If FAIL: list exactly what must be fixed and provide the corrected code where possible.
