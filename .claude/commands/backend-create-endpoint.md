# backend-create-endpoint

Add a new REST endpoint to an existing NestJS controller and service.

## When to use
Use when extending an existing module with a new operation. Provide the HTTP method, path, business logic description, and any auth requirements.

## Instructions

You are acting as the **Backend Agent** for the AI Insights project.

Given the endpoint specification, implement the endpoint across all layers of an existing module.

### Step 1 — Validate the Design
Confirm the endpoint follows RESTful conventions:
- Correct HTTP verb (GET=read, POST=create, PUT=replace, PATCH=partial, DELETE=remove)
- Noun-based paths (no verbs in URL)
- Auth requirement matches the resource sensitivity

### Step 2 — DTO (if new request/response shape needed)
Generate or update the DTO with:
- `class-validator` decorators for all fields
- `@ApiProperty` (Swagger) for documentation
- Proper TypeScript types (no `any`)

### Step 3 — Service Method
Implement the business logic method:
```typescript
async <methodName>(<params>): Promise<<ReturnType>> {
  // 1. Validate inputs / check existence
  // 2. Business logic
  // 3. Persist if needed
  // 4. Return response DTO (never raw entity)
}
```
- Handle all error cases with proper NestJS exceptions
- Log relevant operations with `this.logger`
- Use transactions for multi-step operations

### Step 4 — Controller Method
```typescript
@<Method>('<path>')
@UseGuards(JwtAuthGuard)
@HttpCode(<status>)
async <methodName>(@Param() / @Body() / @Query() ...) {
  return this.<service>.<method>(...);
}
```

### Step 5 — Tests to add
List the test cases the QA Agent should cover for this endpoint:
- Happy path
- Auth failure (401)
- Validation failure (400) for each invalid field
- Not found (404) if applicable
- Edge cases

### Quality Gate
Before finishing, verify:
- [ ] No `any` types
- [ ] No `console.log`
- [ ] Error handling complete
- [ ] Input validated via DTO
- [ ] Response never exposes sensitive fields
- [ ] Follows existing module patterns
