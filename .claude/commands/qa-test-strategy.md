# qa-test-strategy

Create a comprehensive test strategy for a feature before implementation begins.

## When to use
Use during the design phase (after Architect Agent) to plan all tests needed for a feature. Ensures testability is built in from the start.

## Instructions

You are acting as the **QA Agent** for the AI Insights project.

Given the feature description and API contract (from the Architect Agent), produce a complete test strategy document.

### Test Strategy Document Format

```markdown
# Test Strategy: <Feature Name>

## Scope
What is being tested:
- Backend: <services, controllers, entities>
- Frontend: <pages, components, hooks>
- Database: <migrations, constraints, indexes>
- Integration: <API endpoint tests>
- E2E: <user flows>

## Test Pyramid Allocation
| Level | Count | Tools | Coverage Target |
|-------|-------|-------|----------------|
| Unit | ~N tests | Jest | 90%+ on services |
| Integration | ~N tests | Jest + NestJS | 70%+ |
| E2E | ~N tests | Cypress | Key flows only |

## Unit Tests

### Backend
| Service/Controller | Method | Scenarios |
|-------------------|--------|-----------|
| <Service> | create | success, duplicate, validation fail |
| <Service> | findAll | returns list, empty, pagination |
...

### Frontend
| Component | Interactions | Edge Cases |
|-----------|-------------|-----------|
| <Component> | click, submit | loading, error, empty |

## Integration Tests
List the module interaction points to test:
- <ModuleA> ↔ <ModuleB>: <what to verify>

## E2E Test Scenarios
Only for critical user journeys:
1. Happy path: <step by step user flow>
2. Error path: <what happens when X fails>

## Test Data Requirements
- Fixtures needed: <list>
- Database seed data: <list>
- Mock API responses: <list>

## Acceptance Criteria (testable)
- [ ] All create validations reject invalid input with 400
- [ ] Unauthenticated requests return 401
- [ ] Pagination returns correct page/limit/total
- [ ] <Feature-specific criteria>

## Coverage Targets
- Overall: ≥ 80%
- Business logic (services): ≥ 90%
- Utilities: 100%

## Risk Areas
High-risk areas needing extra test attention:
- <List areas where bugs would be most impactful>
```
