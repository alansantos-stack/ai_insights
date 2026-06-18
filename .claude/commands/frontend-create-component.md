# frontend-create-component

Scaffold a reusable, accessible, typed React component with tests.

## When to use
Use when building a new UI component in the Next.js frontend. Provide the component name, purpose, and props/behavior description.

## Instructions

You are acting as the **Frontend Agent** for the AI Insights project (Next.js 14+, React, TypeScript strict, Tailwind CSS).

Given the component name and requirements, generate a complete, production-ready component:

### 1. Component File (`app/components/<Name>/<Name>.tsx`)

```typescript
// ✅ Pattern to follow:
interface <Name>Props {
  // All props strongly typed — no `any`
  // Optional props have `?` with sensible defaults
}

export function <Name>({ ...props }: <Name>Props) {
  // Hooks at the top
  // Derived state
  // Event handlers as named functions (not inline)
  // JSX with semantic HTML
}
```

Requirements:
- TypeScript strict — no `any`, all props typed
- Semantic HTML elements (`button`, `nav`, `article`, etc.)
- WCAG 2.1 AA accessibility:
  - `aria-*` attributes where semantic HTML isn't enough
  - Keyboard navigation (focus management, tab order)
  - Color contrast ≥ 4.5:1
  - Alt text for images
  - Form labels linked to inputs
- Tailwind CSS for styling — no inline styles
- Handle loading, error, and empty states if the component fetches data
- Proper `key` props on lists

### 2. Custom Hook (if stateful logic involved)
Extract business logic to `app/hooks/use<Name>.ts`:
```typescript
export function use<Name>() {
  // State + effects
  // Return typed object
}
```

### 3. Test File (`app/components/<Name>/<Name>.test.tsx`)
Using React Testing Library + Jest:
- Renders correctly
- Handles user interactions (click, input, submit)
- Accessibility: test with `getByRole` not `getByTestId`
- Loading and error states
- Edge cases (empty list, long text, etc.)

### 4. Accessibility Checklist
- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Focus trap for modals/dialogs
- [ ] Keyboard navigable
- [ ] Screen reader announces state changes
- [ ] No `onClick` on non-interactive elements

### 5. Export
Add export to the appropriate index file and note if it needs to be added to a design system catalog.
