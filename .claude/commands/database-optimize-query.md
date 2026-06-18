# database-optimize-query

Analyze a slow database query and produce an optimized version with appropriate indexes.

## When to use
Use when a query is slow, when reviewing TypeORM repository code for performance, or when adding indexes to support new query patterns.

## Instructions

You are acting as the **Database Agent** for the AI Insights project (PostgreSQL, TypeORM).

Given the slow query or repository code, perform a complete query optimization analysis.

### 1. Query Analysis

Parse the query and identify:
- Tables involved and their estimated row counts
- JOIN types and conditions
- WHERE clause predicates (equality, range, IS NULL, LIKE)
- ORDER BY columns
- LIMIT/OFFSET usage
- Subqueries vs JOINs

### 2. EXPLAIN ANALYZE Output Interpretation
If query output is provided, identify:
- Sequential scans on large tables (need indexes)
- Nested loop joins with large row estimates (consider hash joins)
- High actual vs estimated rows (stale statistics — needs `ANALYZE`)
- Sort operations that could use index scans

### 3. Index Recommendations

For each missing index:
```sql
-- Index name, type, and rationale
CREATE INDEX CONCURRENTLY idx_<table>_<columns>
ON <table>(<col1>, <col2>)
WHERE <partial_condition>;  -- if applicable

-- Why this index helps:
-- Query: SELECT ... FROM <table> WHERE col1 = ? ORDER BY col2
-- This index covers both the WHERE and ORDER BY without a sort step
```

Index decision matrix:
| Query Pattern | Index Type |
|---------------|-----------|
| Equality filter on single column | B-tree single |
| Range filter (>, <, BETWEEN) | B-tree |
| Multiple equality filters | Composite B-tree (most selective first) |
| Full-text search | GIN with `tsvector` |
| Partial data (soft deletes) | Partial index `WHERE deleted_at IS NULL` |

### 4. Optimized TypeORM Code

```typescript
// Before (with performance issues annotated)
// After (optimized)
const results = await this.repository
  .createQueryBuilder('entity')
  .select(['entity.id', 'entity.name'])  // Avoid SELECT *
  .leftJoinAndSelect('entity.relation', 'rel')  // Eager load to avoid N+1
  .where('entity.status = :status', { status })  // Parameterized
  .orderBy('entity.createdAt', 'DESC')
  .skip((page - 1) * limit)
  .take(limit)
  .getMany();
```

### 5. Verification Query
```sql
-- Run before and after to measure improvement
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
<your optimized query here>;
```

### 6. Performance Targets
- List queries: < 100ms with pagination
- Single record lookup by indexed column: < 10ms
- Aggregate queries: < 500ms

Document any query that cannot meet targets and recommend caching.
