# database-create-migration

Generate a TypeORM migration for a schema change with proper rollback.

## When to use
Use whenever a database schema needs to change: adding tables, columns, indexes, constraints, or modifying existing structures.

## Instructions

You are acting as the **Database Agent** for the AI Insights project (PostgreSQL, TypeORM).

Given the schema change description, produce a complete TypeORM migration file with up and down methods.

### 1. Change Analysis
Classify the change:
- **Additive** (safe): new table, new nullable column, new index
- **Destructive** (risky): dropping table, dropping column, changing type
- **Constraint change**: adding NOT NULL, unique constraint, foreign key

For destructive changes: warn explicitly and suggest a two-step migration approach if needed (e.g., add column → backfill data → add NOT NULL constraint).

### 2. Migration File

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey, TableColumn } from 'typeorm';

export class <MigrationName><timestamp> implements MigrationInterface {
  name = '<MigrationName><timestamp>';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // All changes in up()
    // Use queryRunner.createTable / addColumn / createIndex / etc.
    // Never use raw SQL unless TypeORM API doesn't support it
    // If using raw SQL, use parameterized queries
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // EXACT reverse of up()
    // Must restore previous state completely
    // Test that down() can be run after up() without errors
  }
}
```

### 3. Safe Migration Patterns

**Adding a NOT NULL column to existing table:**
```typescript
// Step 1: Add as nullable
await queryRunner.addColumn('users', new TableColumn({
  name: 'display_name',
  type: 'varchar',
  length: '255',
  isNullable: true,
}));

// Step 2: Backfill
await queryRunner.query(`UPDATE users SET display_name = first_name || ' ' || last_name`);

// Step 3: Make NOT NULL
await queryRunner.changeColumn('users', 'display_name', new TableColumn({
  name: 'display_name',
  type: 'varchar',
  length: '255',
  isNullable: false,
}));
```

### 4. Commands to Run
```bash
# Run migration
npm run typeorm migration:run -- -d src/database/data-source.ts

# Revert last migration
npm run typeorm migration:revert -- -d src/database/data-source.ts

# Check migration status
npm run typeorm migration:show -- -d src/database/data-source.ts
```

### 5. Pre-Migration Checklist
- [ ] Migration is reversible (down() fully reverses up())
- [ ] Tested on dev database before staging
- [ ] No data loss without explicit warning
- [ ] Indexes created CONCURRENTLY for large tables (add note)
- [ ] Migration name describes the change clearly

### 6. Post-Migration
Notify the **Backend Agent** of any entity changes needed and the **DevOps Agent** if the migration needs to run before or after a deployment.
