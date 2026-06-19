# Feature Briefing: Client SLA Modal

**Status:** Draft  
**Date:** 2026-06-18  
**Feature:** Clickable insight cards with top-clients SLA degradation modal

---

## Problem Statement

Insight cards display a Cortex-generated text summary but provide no drill-down capability. When the SLA degradation insight fires ("SLA Over Average — Client Performance Degradation"), operators cannot see which clients are driving the issue. The data exists in Snowflake; there is no path from the card to it.

---

## Feature Description

Insight cards become clickable. Clicking opens a modal overlay displaying the top 10 clients ranked by SLA overrun relative to their own historical average.

**Modal behavior:**
- Opens on card click
- Dismisses on close button click or outside click
- Dark-themed table matching dashboard visual style

**Table columns:**

| Column | Description |
|---|---|
| IDCLIENT | Client identifier |
| Avg SLA Last Month | Average SLA duration (days) in the most recent month |
| Historical Avg SLA | Long-run average SLA for that client |
| Over Own Avg (days) | Avg SLA Last Month − Historical Avg SLA |

**Sort order:** Descending by "Over Own Avg (days)" — clients furthest above their own historical average appear first.

**Sample data (target UI):**

| IDCLIENT | Avg SLA Last Month | Historical Avg SLA | Over Own Avg (days) |
|---|---|---|---|
| 93085777000187 | 14.0 | 1.94 | +12.06 |
| 42527411000180 | 15.0 | 3.71 | +11.29 |
| 46162282000124 | 14.0 | 2.82 | +11.18 |
| 42541940000138 | 19.0 | 8.50 | +10.50 |
| 78255916000180 | 14.0 | 3.75 | +10.25 |
| 36427615000146 | 13.0 | 3.69 | +9.31 |
| 07282566658 | 13.0 | 3.71 | +9.29 |
| 46310969000160 | 16.25 | 7.19 | +9.06 |
| 11474450000132 | 13.0 | 3.96 | +9.04 |
| 02246972000196 | 13.0 | 4.10 | +8.90 |

---

## Data Source

- **Snowflake database:** `AZULCARGO`
- **Role:** `SMARTKARGO_OPERACAO_USERS`
- **New endpoint:** `GET /insights/top-clients`

**Computed field:**

```
Over Own Avg (days) = Avg SLA Last Month − Historical Avg SLA
```

**Query approach (to be evaluated in order of preference):**

1. **Direct SQL aggregate** — preferred; deterministic, lower latency, easier to test
2. **Snowflake Cortex COMPLETE returning structured JSON** — fallback if the required columns are not directly queryable

---

## Architecture Impact

### Backend

- New service method in `InsightsService`: `getTopClientsBySlaDeviation()`
- New controller route: `GET /insights/top-clients`
- Returns array of up to 10 records, sorted by `overOwnAvg` descending
- Response shape:

```typescript
interface TopClientSlaRecord {
  idClient: string;
  avgSlaLastMonth: number;
  historicalAvgSla: number;
  overOwnAvg: number; // avgSlaLastMonth - historicalAvgSla
}
```

### Frontend

- Insight card component gains `onClick` handler and loading state
- New `ClientSlaModal` component (modal overlay + table)
- Modal data fetched on card click via `GET /insights/top-clients`
- No new global state required; local component state is sufficient

### No changes required to:
- Existing Cortex monthly query flow
- Card rendering logic (text summary remains)
- Flat-file JSON store

---

## Success Criteria

| Criterion | Target |
|---|---|
| Modal opens after card click | Within 2 seconds |
| Table rows shown | Top 10, sorted by Over Own Avg descending |
| Modal dismissal | Close button and outside click both work |
| Regression | Existing card display and Cortex trigger flow unaffected |

---

## Out of Scope (this iteration)

- Pagination beyond top 10
- Client detail drill-down from modal
- CSV export
- Card-specific filtering — all cards show the same top-clients table for now

---

## Open Questions

1. What are the exact table and column names in `AZULCARGO` that contain shipment SLA data?
2. Should different insight card types eventually show different modal data, or is a single top-clients view sufficient long-term?
3. Should modal data be re-fetched on every open, or cached for the browser session?
