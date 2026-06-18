# AI Insights — MVP Briefing Plan

## Overview

Monthly scheduled job queries **Snowflake Cortex AI**, optionally persists results to a **JSON file store**, and exposes them via a **REST API** consumed by a Next.js dashboard.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS (TypeScript) |
| Scheduler | `@nestjs/schedule` — cron `0 0 1 * *` |
| Snowflake client | `snowflake-sdk` |
| Database (MVP) | JSON flat file (`lowdb` or raw `fs/json`) |
| Frontend | Next.js 16 + Tailwind |
| API contract | REST: `GET /insights`, `POST /insights/trigger` |

---

## Backend Architecture

```
backend/src/
├── app.module.ts
├── scheduler/
│   └── insights.scheduler.ts      ← @Cron('0 0 1 * *')
├── snowflake/
│   ├── snowflake.module.ts
│   └── snowflake.service.ts       ← executes Cortex query
├── insights/
│   ├── insights.module.ts
│   ├── insights.service.ts        ← saves/reads JSON store
│   ├── insights.controller.ts     ← GET /insights, POST /insights/trigger
│   └── insights.repository.ts    ← wraps JSON file I/O
└── database/
    ├── db.service.ts              ← JSON file adapter
    ├── db.module.ts
    └── db.json                    ← flat file store
```

### Scheduler Flow

1. Cron fires on day 1 of each month at midnight
2. `SnowflakeService.runCortexQuery()` — connects and executes a Cortex `COMPLETE` function
3. If result rows returned → `InsightsService.save(result)` with timestamp + run metadata
4. If no rows → log and skip (no write)

### Insight Record Shape

```ts
{
  id: string,       // uuid
  runDate: string,  // ISO date (YYYY-MM-DD)
  query: string,    // the Cortex prompt used
  result: object,   // raw Cortex response
  savedAt: string   // ISO timestamp
}
```

---

## Snowflake Cortex Integration

Uses `snowflake-sdk` to connect and execute a SQL Cortex function:

```sql
SELECT SNOWFLAKE.CORTEX.COMPLETE('mistral-7b', 'Summarize key trends from last month data...')
```

Credentials via environment variables:

| Variable | Description |
|---|---|
| `SNOWFLAKE_ACCOUNT` | e.g. `xy12345.us-east-1` |
| `SNOWFLAKE_USER` | Snowflake username |
| `SNOWFLAKE_PASSWORD` | Snowflake password |
| `SNOWFLAKE_DATABASE` | Target database |
| `SNOWFLAKE_WAREHOUSE` | Compute warehouse |
| `SNOWFLAKE_SCHEMA` | Target schema |

---

## Frontend Architecture

```
frontend/app/
├── page.tsx              ← insights list (home)
├── components/
│   ├── InsightCard.tsx   ← single insight display
│   └── InsightList.tsx   ← maps over insights
└── lib/
    └── api.ts            ← fetch wrapper for backend
```

**UI:** Simple list of insight cards — each shows run date, query used, and the AI result. Empty state when no insights yet. Manual trigger button (`POST /insights/trigger`) for dev/testing purposes.

---

## Open Questions

1. **Which Cortex function?** `COMPLETE`, `ANALYST`, or a stored procedure? This defines the query shape.
2. **What data does Cortex analyze?** Does it reference a Snowflake table, or is it a freestanding prompt?
3. **Snowflake credentials** — real or mocked? (MVP uses fakes, replace before prod)
4. **JSON store location** — `backend/src/database/db.json` — confirm it should be gitignored.

---

## Build Order

| Step | Scope | Agent Role |
|---|---|---|
| 1 | Install `@nestjs/schedule`, create cron scaffold | Backend |
| 2 | JSON store + InsightsRepository (save/read) | Database |
| 3 | InsightsController — `GET /insights`, `POST /insights/trigger` | Backend |
| 4 | SnowflakeService with fake credentials | Backend |
| 5 | Wire scheduler → Snowflake → repository + app.module.ts | Backend |
| 6 | Frontend: fetch insights, render list + trigger button | Frontend |

Steps 2, 4, and 6 are independent and can be executed in parallel.

---

## Environment Setup

Create `backend/.env`:

```env
SNOWFLAKE_ACCOUNT=fake_account.us-east-1
SNOWFLAKE_USER=fake_user
SNOWFLAKE_PASSWORD=fake_password
SNOWFLAKE_DATABASE=FAKE_DB
SNOWFLAKE_WAREHOUSE=FAKE_WH
SNOWFLAKE_SCHEMA=PUBLIC
PORT=3001
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```
