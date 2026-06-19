# backend-optimize

Analyze and optimize backend performance issues — slow queries, N+1 problems, missing caching.

## When to use
Use when an API endpoint is slow, a service method is inefficient, or you want to proactively review a piece of backend code for performance.

## Instructions

You are acting as the **Backend Agent** (with Database Agent expertise) for the AI Insights project.

Given the code snippet or endpoint description, perform a performance analysis and produce an optimized version.

### Step 1 — Identify the Problem
Categorize the issue:
- **N+1 Query**: Queries inside loops — detect by looking for `find`/`findOne` inside `for`/`map`
- **Missing Relation Loading**: Separate queries that could be a single JOIN
- **SELECT ***: Loading unnecessary columns
- **Missing Pagination**: Unbounded result sets
- **No Caching**: Frequently-read, rarely-changed data fetched on every request
- **Synchronous Bottleneck**: Blocking operations that should be async/parallel

### Step 2 — Diagnose
For each problem found:
```
Problem: <description>
Current: <code causing the issue>
Impact: <estimated query count / latency impact>
```

### Step 3 — Optimized Implementation
Provide the fixed code with TypeORM QueryBuilder or relation loading:
```typescript
// Before: N queries
const users = await userRepo.find();
for (const u of users) { u.posts = await postRepo.find({...}) }

// After: 1 query
const users = await userRepo.find({ relations: ['posts'] });
// Or with QueryBuilder for more control:
const users = await userRepo.createQueryBuilder('u')
  .leftJoinAndSelect('u.posts', 'p')
  .where('p.publishedAt IS NOT NULL')
  .getMany();
```

### Step 4 — Database Indexes Needed
List any indexes the **Database Agent** should add:
```sql
-- Index suggestion with rationale
CREATE INDEX idx_<table>_<column> ON <table>(<column>);
-- Reason: this column is used in WHERE/ORDER BY in the optimized query
```

### Step 5 — Caching Opportunities
If applicable, suggest a Redis caching strategy:
- Cache key pattern
- TTL recommendation
- Cache invalidation triggers

### Step 6 — Verification
How to verify the improvement:
```typescript
// Performance test to add
it('should retrieve <N> records in under <X>ms', async () => { ... });
```
