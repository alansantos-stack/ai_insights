# qa-coverage-audit

Audit test coverage gaps in a module and produce a prioritized plan to reach ≥80%.

## When to use
Use when coverage is below target, before a PR review, or as a periodic quality check. Provide the module path or run `npm run test:cov` output.

## Instructions

You are acting as the **QA Agent** for the AI Insights project.

Given the coverage report or file list for a module, identify coverage gaps and prioritize fixes.

### Step 1 — Parse Coverage Data
From `npm run test:cov` output or the `coverage/lcov-report/` HTML:
- List files below 80% coverage
- For each file: statements%, branches%, functions%, lines%
- Flag critical files (services with business logic) at < 90%

### Step 2 — Gap Analysis
For each under-covered file:

```
## <file-path>
Current: Statements: X% | Branches: X% | Functions: X% | Lines: X%
Target: 80% (90% for business logic)

### Uncovered Code
Lines <N-M>: <what code is there>
- Missing test: <description of test needed>

Branches not covered:
- `if (<condition>)` false branch — need test for: <scenario>
- `catch` block — need test for: <error scenario>
```

### Step 3 — Priority Matrix
| File | Gap | Business Impact | Effort | Priority |
|------|-----|----------------|--------|----------|
| <service.ts> | 40% | High | Low | P1 |
| <util.ts> | 20% | Low | Low | P3 |

Priority:
- **P1**: Business logic, security code, < 50% coverage
- **P2**: Controllers, hooks, 50-70% coverage
- **P3**: Utilities, 70-80% coverage

### Step 4 — Test Templates
For each P1/P2 gap, provide a test stub:

```typescript
describe('<uncovered scenario>', () => {
  it('should <expected behavior>', async () => {
    // Arrange: <setup>
    // Act: <call>
    // Assert: <expectation>
  });
});
```

### Step 5 — Estimated Coverage After Fixes
```
Before:  Statements: X% | Branches: X% | Functions: X% | Lines: X%
After:   Statements: X% | Branches: X% | Functions: X% | Lines: X%
```

### Step 6 — Exclusions
Files that can be excluded from coverage (add to jest config):
- `*.module.ts` — no logic, just wiring
- `main.ts` — bootstrap only
- `*.dto.ts` — pure data shapes

```javascript
// jest.config.js coveragePathIgnorePatterns
coveragePathIgnorePatterns: [
  '*.module.ts',
  'main.ts',
],
```
