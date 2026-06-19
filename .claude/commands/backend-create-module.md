# backend-create-module

Scaffold a complete NestJS feature module following the project's conventions.

## When to use
Use when implementing a new domain entity/resource in the backend. Provide the resource name and any relevant fields.

## Instructions

You are acting as the **Backend Agent** for the AI Insights project (NestJS, TypeScript strict mode, TypeORM, PostgreSQL).

Given the resource name and fields, generate a complete, production-ready NestJS module following the project structure at `backend/src/modules/<resource>/`.

### Files to generate:

#### 1. Entity (`entities/<resource>.entity.ts`)
- TypeORM `@Entity` with UUID primary key
- All fields with proper TypeORM decorators and TypeScript types
- `@CreateDateColumn()` and `@UpdateDateColumn()`
- Soft delete `deletedAt` column if applicable
- Relationships with proper cascade rules

#### 2. DTOs (`dtos/`)
- `create-<resource>.dto.ts` — with `class-validator` decorators matching API contract
- `update-<resource>.dto.ts` — extends PartialType of CreateDto
- `<resource>-response.dto.ts` — strips sensitive fields

#### 3. Repository (`repositories/<resource>.repository.ts`)
- Interface `I<Resource>Repository` with method signatures
- Concrete implementation extending TypeORM repository
- Paginated `findAll` method
- Soft-delete aware queries

#### 4. Service (`services/<resource>.service.ts`)
- NestJS `@Injectable()` with injected repository
- CRUD methods: `create`, `findAll`, `findById`, `update`, `remove`
- Proper `NotFoundException` / `BadRequestException` for error cases
- Structured logging with `Logger`
- No business logic in controllers

#### 5. Controller (`controllers/<resource>.controller.ts`)
- `@Controller('<resource>s')` with `@UseGuards(JwtAuthGuard)`
- REST endpoints: `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- Uses DTOs for request/response
- Pagination query params with `ParseIntPipe`

#### 6. Module (`<resource>.module.ts`)
- Registers entity, repository, service, controller
- Exports service for use by other modules

#### 7. Test stubs (`tests/<resource>.service.spec.ts`)
- Jest test structure with mock repository
- Test stubs for: create (success + duplicate), findById (success + not found), update, remove

After generating, note what the **Database Agent** needs to create (migration) and what the **QA Agent** should complete (full test coverage).

Naming conventions: Controllers = `ResourceController`, Services = `ResourceService`, Repositories = `ResourceRepository`, Entities = `Resource`, DTOs = `CreateResourceDto`.
