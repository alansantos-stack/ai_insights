# insight-add

Add a new Snowflake Cortex insight type end-to-end: SQL query, backend service method, controller endpoint, shared type, frontend API function, and display component.

## When to use
Use when the business requests a new category of AI-generated analysis from Snowflake Cortex. This skill covers the full vertical slice — from the SQL prompt sent to `SNOWFLAKE.CORTEX.COMPLETE` all the way to the React component that renders the result. Invoke it once per new insight type rather than coordinating each layer separately.

## Instructions

You are acting as the **Backend Agent** and **Frontend Agent** for the AI Insights project.

You will need: (1) a slug name for the insight (e.g., `route-efficiency`), (2) the Cortex prompt text, and (3) the expected JSON shape of the response array (field names and types).

### Step 1 — Define the shared type

Open `backend/src/shared/types.ts` and add a new exported interface for the structured response rows. Model it after `ClientSlaRow`:

```typescript
export interface <SlugPascalCase>Row {
  // one field per key the Cortex prompt instructs the model to return
  <fieldName>: <type>;
}
```

The existing `InsightRecord` type (with `result: unknown`) is already used for the generic flat-file store — do not alter it.

### Step 2 — Write the SQL constant

Open `backend/src/snowflake/snowflake.service.ts`. Add a new `const` above the `@Injectable()` class, following the `TOP_CLIENTS_SQL` pattern exactly:

```typescript
const <SLUG_UPPER>_SQL = `
SELECT SNOWFLAKE.CORTEX.COMPLETE(
  'mistral-7b',
  $$<your prompt here>.
Return ONLY a valid JSON array with no explanation, no markdown, no code blocks.
The array must contain exactly <N> objects with these keys:
- "<fieldName>": <type description>
Order by <field> descending.$$
) AS RESULT`;
```

Rules:
- Always alias the column as `RESULT` (the service reads `rows[0].RESULT`).
- Always use `$$...$$` dollar-quoting for the prompt string.
- Always use model `'mistral-7b'` unless a different model is explicitly specified.

### Step 3 — Add a SnowflakeService method

In `backend/src/snowflake/snowflake.service.ts`, add a new async method to the `SnowflakeService` class. Copy the structure of `runTopClientsQuery()` verbatim and adapt:

- Method name: `run<SlugPascalCase>Query(): Promise<<SlugPascalCase>Row[] | null>`
- Replace `TOP_CLIENTS_SQL` with the new SQL constant.
- Replace the mock return value with realistic sample data matching the new type.
- Replace the log label string (`'Top-clients Cortex response is not an array'`) with the new slug name.
- The env var guard (`SNOWFLAKE_ACCOUNT`, `SNOWFLAKE_USER`, `INTEGRATION_MSAL_ACCESS_TOKEN`) and the connection setup block are identical — do not modify them.

### Step 4 — Add a controller endpoint

Open `backend/src/insights/insights.controller.ts`. Add a `@Get('<slug>')` method:

```typescript
@Get('<slug>')
async get<SlugPascalCase>(): Promise<{ <slug>: <SlugPascalCase>Row[] }> {
  const rows = await this.snowflakeService.run<SlugPascalCase>Query();
  if (rows === null) {
    throw new HttpException(
      { error: 'Failed to fetch <slug> data' },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
  return { <slug>: rows };
}
```

The controller already imports `HttpException` and `HttpStatus` — no new imports needed unless the type is not yet imported from `'../shared/types'`.

### Step 5 — Add a frontend API function

Open `frontend/app/lib/api.ts`. Add:

1. A mirroring `export interface <SlugPascalCase>Row` (same fields as the backend type).
2. A fetch function following the `getTopClients()` pattern:

```typescript
export async function get<SlugPascalCase>(): Promise<<SlugPascalCase>Row[]> {
  const res = await fetch(`${BASE}/insights/<slug>`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch <slug>: ${res.status}`);
  }
  const data = await res.json();
  return data.<slug>;
}
```

### Step 6 — Create a frontend display component

Create `frontend/app/components/<SlugPascalCase>Table.tsx` (or `Card` if the data is a single object, not a list). Model it after the existing `InsightCard.tsx` component conventions:

- `'use client'` directive at the top.
- Accept the row array as a typed prop: `{ rows: <SlugPascalCase>Row[] }`.
- Use only CSS custom property tokens for colors — never raw hex or Tailwind color-scale classes. Reference the token list in `frontend/app/globals.css`:
  - Text: `var(--color-text-heading)`, `var(--color-text-body)`, `var(--color-text-caption)`, `var(--color-text-muted)`, `var(--color-text-mono)`
  - Surface: `var(--color-surface)`, `var(--color-surface-subtle)`, `var(--color-surface-inner)`
  - Border: `var(--color-border)`, `var(--color-border-inner)`
  - Brand: `var(--color-brand)`, `var(--color-brand-hover)`, `var(--color-brand-ring)`
  - Status: `var(--color-danger)`, `var(--color-success)`
- Wrap numeric columns with appropriate status color if they indicate deviation (e.g., high `overOwnAvg` → `var(--color-danger)`).
- Add a meaningful `aria-label` on the container element.

### Step 7 — Wire into InsightsDashboard if needed

If the new insight should appear on the main dashboard, open `frontend/app/components/InsightsDashboard.tsx` and add a `useEffect` or server-side fetch for `get<SlugPascalCase>()`, then render the new component alongside the existing ones.

### Quality Gate
- [ ] New SQL constant uses `RESULT` column alias and `$$...$$` dollar-quoting
- [ ] Mock data in the service method matches the new type shape exactly
- [ ] Controller method returns `HttpStatus.SERVICE_UNAVAILABLE` (not 500) on `null`
- [ ] Frontend type mirrors backend type field-for-field
- [ ] No hardcoded hex colors or raw Tailwind color-scale classes in the new component
- [ ] `cache: 'no-store'` set on all new `fetch()` calls in `api.ts`
- [ ] No `any` types anywhere in the new code
