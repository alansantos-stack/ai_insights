# snowflake-query-validate

Validate a new Snowflake Cortex SQL query against the service conventions before wiring it into the backend.

## When to use
Use whenever a new `const SQL` string is being authored for `backend/src/snowflake/snowflake.service.ts`. The service has strict conventions around function call syntax, column aliasing, response parsing, and mock mode that are not enforced by TypeScript at compile time — this skill catches structural mistakes before they cause silent `null` returns or runtime parse errors.

## Instructions

You are acting as the **Architect Agent** and **Backend Agent** for the AI Insights project.

You need the candidate SQL string and the intended response shape (will the result be parsed as JSON, or returned raw?).

### Step 1 — Validate Cortex function call syntax

The service exclusively uses `SNOWFLAKE.CORTEX.COMPLETE`. Confirm:

- Function path is exactly `SNOWFLAKE.CORTEX.COMPLETE` (not `cortex.complete` or any other casing/path).
- First argument is a string model name. Currently both existing queries use `'mistral-7b'`. Accept any valid Cortex model name; flag if the argument is a variable reference rather than a literal.
- Second argument (the prompt) is dollar-quoted with `$$...$$` when it spans multiple lines. Single-quoted prompts `'...'` are only acceptable for one-line prompts with no embedded single quotes.
- The `SELECT ... AS RESULT` alias is present. The service reads `rows[0].RESULT` — a different alias causes a silent `undefined`.

Flag any deviation from these rules as a blocking issue.

### Step 2 — Determine response handling path

There are two established patterns in `snowflake.service.ts`:

**Pattern A — Raw record (used by `runCortexQuery`)**
The entire first row is stored as `InsightRecord.result` (typed `unknown`). The query returns a single row with a text `RESULT` column. No `JSON.parse` is called. Use this pattern when the result is a freeform text analysis saved to the flat-file store via `InsightsService.save()`.

**Pattern B — Structured JSON array (used by `runTopClientsQuery`)**
The Cortex prompt instructs the model to return a JSON array. The service calls `JSON.parse(rows[0].RESULT as string)` and validates `Array.isArray(parsed)`. Use this pattern when the result is a typed list of domain objects (e.g., `ClientSlaRow[]`) returned directly from a controller endpoint.

Identify which pattern the new query should follow and confirm the prompt instructions match:
- Pattern A: prompt should request a text narrative.
- Pattern B: prompt must instruct `Return ONLY a valid JSON array with no explanation, no markdown, no code blocks.` — this exact phrasing has proven necessary to prevent the model from wrapping output in markdown fences.

### Step 3 — Validate mock data shape

Each service method has a `SNOWFLAKE_MOCK === 'true'` branch that returns hardcoded data. Confirm:

- The mock data type matches the declared return type (`InsightRecord | null` for Pattern A, `<Type>[] | null` for Pattern B).
- For Pattern B: every field in the mock objects is present in the new TypeScript interface in `backend/src/shared/types.ts`, and the value types are correct (string vs. number).
- The mock branch logs: `this.logger.log('Mock mode — returning fake <description> result')`.
- The mock branch is guarded by `process.env.SNOWFLAKE_MOCK === 'true' && process.env.NODE_ENV === 'production'` throwing an error first (this block already exists in both methods — just confirm it is copied, not omitted).

### Step 4 — Validate env var guard

The method must check `SNOWFLAKE_ACCOUNT`, `SNOWFLAKE_USER`, and `INTEGRATION_MSAL_ACCESS_TOKEN` before connecting. Confirm the guard follows the existing pattern:

```typescript
const requiredVars: Record<string, string | undefined> = {
  SNOWFLAKE_ACCOUNT: process.env.SNOWFLAKE_ACCOUNT,
  SNOWFLAKE_USER: process.env.SNOWFLAKE_USER,
  INTEGRATION_MSAL_ACCESS_TOKEN: process.env.INTEGRATION_MSAL_ACCESS_TOKEN,
};
const missing = Object.entries(requiredVars)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length > 0) {
  this.logger.error(`Missing required env vars: ${missing.join(', ')}`);
  return null;
}
```

Flag if `return null` is replaced with a thrown exception here — the controller layer handles `null` returns with `HttpStatus.SERVICE_UNAVAILABLE`, so throwing would bypass that contract.

### Step 5 — Validate error logging in catch block

The catch block must log three fields using `this.logger.error(...)`:
- `message` (from `err.message` or `String(err)`)
- `code` (from `err.code` if present, else `undefined`)
- `sqlState` (from `err.sqlState` if present, else `undefined`)

This matches the existing Snowflake SDK error shape and preserves observability. A bare `console.error` or a re-thrown error is a violation.

### Step 6 — Report

Produce a structured report:

**PASS / FAIL** per check:
- [ ] `SNOWFLAKE.CORTEX.COMPLETE` syntax correct
- [ ] Column aliased as `RESULT`
- [ ] Response handling pattern identified and consistent with prompt instructions
- [ ] Mock data shape matches declared type
- [ ] Production mock guard present
- [ ] Env var guard present and returns `null` (not throws)
- [ ] Catch block logs `message`, `code`, `sqlState`

List any blocking issues with the exact line or text that must change before the query is safe to wire into the service.

### Quality Gate
- [ ] Zero blocking issues in the Step 6 report before the method is committed
- [ ] SQL constant name follows the `<SLUG_UPPER>_SQL` convention (e.g., `ROUTE_EFFICIENCY_SQL`)
- [ ] Method name follows `run<SlugPascalCase>Query()` convention
- [ ] Return type is either `Promise<InsightRecord | null>` (Pattern A) or `Promise<<Type>[] | null>` (Pattern B) — never `Promise<any>`
- [ ] No raw `console.log` or `console.error` calls — use `this.logger`
