# qa-write-tests

Write comprehensive unit and integration tests for a service, controller, or component.

## When to use
Use after implementation is complete to achieve ≥80% test coverage. Provide the file path(s) to test.

## Instructions

You are acting as the **QA Agent** for the AI Insights project (Jest, React Testing Library, NestJS Testing utilities).

Given the implementation file(s), generate comprehensive tests achieving 80%+ coverage.

### For NestJS Backend (Service or Controller)

```typescript
describe('<ClassName>', () => {
  let sut: <ClassName>;  // System Under Test
  let dep: jest.Mocked<<Dependency>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        <ClassName>,
        { provide: <Dependency>, useValue: createMock<<Dependency>>() },
      ],
    }).compile();

    sut = module.get(<ClassName>);
    dep = module.get(<Dependency>);
  });

  // Test structure: describe by METHOD, then by SCENARIO
  describe('<methodName>', () => {
    describe('when <happy path condition>', () => {
      it('should <expected behavior>', async () => {
        // Arrange
        const input = <valid input>;
        dep.<method>.mockResolvedValue(<expected response>);
        
        // Act
        const result = await sut.<method>(input);
        
        // Assert
        expect(result).<assertion>;
        expect(dep.<method>).toHaveBeenCalledWith(<expected args>);
      });
    });

    describe('when <error condition>', () => {
      it('should throw <ExceptionType>', async () => {
        dep.<method>.mockResolvedValue(null);
        await expect(sut.<method>(<input>)).rejects.toThrow(<ExceptionType>);
      });
    });
  });
});
```

**Required test scenarios for every CRUD service:**
1. Create: success, duplicate email/unique field, validation failure
2. FindAll: returns list, returns empty array, pagination works
3. FindById: found, not found (throws NotFoundException)
4. Update: success, not found, partial update
5. Delete: success, not found, soft delete if applicable

### For React Frontend (Component)

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('<ComponentName>', () => {
  const defaultProps = { /* required props */ };

  it('renders without crashing', () => {
    render(<Component {...defaultProps} />);
    // Use getByRole — prefer semantic queries
    expect(screen.getByRole('<role>', { name: /<text>/i })).toBeInTheDocument();
  });

  it('calls <handler> when <action>', async () => {
    const handler = jest.fn();
    const user = userEvent.setup();
    render(<Component {...defaultProps} onAction={handler} />);
    
    await user.click(screen.getByRole('button', { name: /<label>/i }));
    expect(handler).toHaveBeenCalledWith(<expected args>);
  });

  it('shows loading state', () => { /* ... */ });
  it('shows error state', () => { /* ... */ });
  it('is accessible — has correct aria attributes', () => { /* ... */ });
});
```

### Edge Cases to Always Cover
- Null/undefined inputs
- Empty strings and arrays
- Boundary values (0, -1, MAX)
- Special characters in text fields
- Concurrent/race conditions if applicable

### Coverage Check
After writing tests, estimate coverage for:
- Statements: X%
- Branches: X%
- Functions: X%
- Lines: X%

Flag any coverage gaps and explain why they're acceptable or how to cover them.

### Test Quality Checklist
- [ ] Tests describe behavior, not implementation
- [ ] Each `it` block has a single assertion focus
- [ ] No test interdependencies
- [ ] Mocks reset between tests (`beforeEach`)
- [ ] No timeouts / flaky async patterns
- [ ] `data-testid` used only as last resort (prefer `getByRole`)
