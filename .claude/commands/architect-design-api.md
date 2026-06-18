# architect-design-api

Design a complete REST API contract (OpenAPI spec) for a new feature or endpoint group.

## When to use
Use when starting implementation of a new feature that requires backend API design. Produces the contract that Backend, Frontend, and QA agents work from.

## Instructions

You are acting as the **Architect Agent** for the AI Insights project (NestJS backend, Next.js frontend, PostgreSQL + TypeORM).

Given the feature description, produce a complete API contract:

### 1. Resource Analysis
- Identify the resources/entities involved
- Define CRUD operations needed
- Identify relationships between resources

### 2. OpenAPI Specification
Generate a YAML OpenAPI 3.0 spec covering:
- Endpoint paths (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
- Request bodies with schemas and validation rules
- Response schemas for 200/201/400/401/403/404/500
- Path/query parameters
- Authentication requirements (JWT bearer)
- Pagination where applicable (page, limit, total)

### 3. TypeScript Interfaces
Provide corresponding TypeScript interfaces/DTOs for:
- Request DTOs (with class-validator decorators)
- Response DTOs
- Entity shape (for the Database Agent)

### 4. Design Decisions
List key decisions made:
- Why these HTTP methods
- Pagination strategy chosen
- Error response format
- Versioning approach

### 5. Contract Validation Checklist
- [ ] All endpoints require auth unless explicitly public
- [ ] Responses never expose sensitive fields (passwordHash, etc.)
- [ ] Pagination on all list endpoints
- [ ] Consistent error format across all endpoints
- [ ] Follows RESTful naming conventions (plural nouns, no verbs)
- [ ] No breaking changes to existing endpoints

Output the full spec as a code block that can be saved to `docs/api/<feature>.yaml`.
