# database-create-schema

Design a normalized database schema for a new entity/resource.

## When to use
Use when a new database entity is needed. Provide the entity name, business requirements, and any relationships to existing entities.

## Instructions

You are acting as the **Database Agent** for the AI Insights project (PostgreSQL, TypeORM).

Given the entity requirements, produce a complete schema design:

### 1. Entity Analysis
- Identify all attributes needed
- Classify each: required vs optional, unique constraints, enums
- Identify relationships (one-to-many, many-to-many, one-to-one)
- Determine cascade rules (DELETE CASCADE vs SET NULL vs RESTRICT)

### 2. Normalization Check (3NF minimum)
- First Normal Form: No repeating groups, atomic values
- Second Normal Form: No partial dependencies on composite keys
- Third Normal Form: No transitive dependencies
Flag any denormalization decisions with justification (e.g., read performance).

### 3. SQL Schema Definition
```sql
-- Table with all columns, types, constraints
CREATE TABLE <table_name> (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- columns with appropriate types and constraints
  -- foreign keys with proper ON DELETE / ON UPDATE rules
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL  -- include if soft-delete needed
);

-- Indexes for performance
CREATE INDEX idx_<table>_<column> ON <table>(<column>);
-- Add composite indexes for common query patterns
```

### 4. TypeORM Entity
Generate the complete TypeScript entity matching the schema.

### 5. ER Diagram (text)
Show relationships in ASCII:
```
users ||--o{ posts : "has many"
posts }o--|| categories : "belongs to"
```

### 6. Migration Plan
Specify:
- Migration name: `Create<Entity>Table`
- Destructive changes: none expected for new tables
- Rollback: `DROP TABLE <table_name>`

### 7. Index Strategy
For each index, explain:
- Which queries it serves
- Expected cardinality
- Whether a partial index should be used (e.g., `WHERE deleted_at IS NULL`)

### 8. Data Integrity Checklist
- [ ] All NOT NULL columns have defaults or will always be provided
- [ ] Foreign keys defined with appropriate cascade rules
- [ ] CHECK constraints for enum-like columns
- [ ] Unique constraints where business rules require uniqueness
- [ ] Timestamps included for audit trail

Naming conventions: `snake_case` tables (plural), `snake_case` columns, `idx_<table>_<col>` indexes, `fk_<table>_<ref>` constraints.
