# frontend-a11y-audit

Audit a component or page for WCAG 2.1 AA accessibility issues and produce a fix plan.

## When to use
Use before submitting a PR that includes UI changes, or when asked to improve accessibility of an existing component or page.

## Instructions

You are acting as the **Frontend Agent** specializing in accessibility for the AI Insights project.

Given the component code, page, or route path, perform a complete WCAG 2.1 AA audit:

### 1. Semantic HTML Audit
Check each element:
- Are interactive elements using `<button>` (not `<div onClick>`)? 
- Is heading hierarchy correct (`h1` → `h2` → `h3`, no skips)?
- Are lists using `<ul>`/`<ol>`/`<li>`?
- Are forms using `<form>`, `<label>`, `<input>` properly?
- Is the `<main>` landmark present?

### 2. ARIA Audit
- Missing `aria-label` on icon-only buttons
- Missing `role` on custom interactive widgets
- Missing `aria-live` for dynamic content updates
- Incorrect `aria-expanded`/`aria-selected`/`aria-checked` states
- `aria-hidden` hiding focusable elements

### 3. Keyboard Navigation Audit
- Can all interactions be triggered via keyboard alone?
- Is focus order logical (matches visual/DOM order)?
- Are modals/dialogs trapping focus correctly?
- Does `Escape` close dismissible overlays?
- Are custom dropdowns/comboboxes keyboard navigable?

### 4. Color & Contrast Audit
List elements that need contrast checking:
- Normal text: must be ≥ 4.5:1
- Large text (18pt+ or 14pt bold): ≥ 3:1
- UI components / graphical objects: ≥ 3:1
- Flag any color-only information conveyance

### 5. Images & Media
- All `<img>` have meaningful `alt` text (or `alt=""` for decorative)
- SVG icons have `aria-hidden="true"` or `<title>` + `role="img"`
- Next.js `<Image>` components have `alt` prop

### 6. Forms
- Every `<input>` / `<select>` / `<textarea>` has an associated `<label>`
- Error messages are linked via `aria-describedby`
- Required fields marked with `aria-required` or `required`
- Error states announced via `aria-live="polite"` or `role="alert"`

### 7. Fix Plan
For each issue found:
```
## Issue: <WCAG criterion> — <Short description>
**Severity**: Critical | Major | Minor
**Current Code**:
\`\`\`tsx
<bad code>
\`\`\`
**Fixed Code**:
\`\`\`tsx
<fixed code>
\`\`\`
**WCAG Criterion**: 1.1.1 / 1.3.1 / 2.1.1 / etc.
```

### 8. Summary
```
## Accessibility Audit Summary
- Critical issues: N
- Major issues: N
- Minor issues: N
- WCAG 2.1 AA compliance: Pass / Fail / Partial
```
