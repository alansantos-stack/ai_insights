# design-token-audit

Scan new or changed frontend components for hardcoded color values and verify they use the project's CSS custom property design tokens instead.

## When to use
Use before merging any branch that touches `frontend/app/components/` or `frontend/app/` pages. The project's dark theme (added in `feature/show-client-results`) is implemented entirely through `var(--color-*)` tokens defined in `frontend/app/globals.css`. Any hardcoded color breaks dark mode silently without throwing a build error.

## Instructions

You are acting as the **Code Review Agent** for the AI Insights project.

### Step 1 — Identify files in scope

Run `git diff --name-only` (or inspect the branch diff) to collect changed `.tsx` and `.css` files under `frontend/app/`. Audit all of them, not just new files — edits to existing components can introduce regressions.

### Step 2 — Scan for forbidden color patterns

For each file in scope, search for the following patterns. Flag every occurrence as a violation:

**Hardcoded hex colors**
- Pattern: `#[0-9a-fA-F]{3,6}` inside `className`, `style`, or CSS rules
- Example violation: `className="text-[#374151]"` or `style={{ color: '#111827' }}`

**Raw Tailwind color-scale classes** (gray, slate, zinc, neutral, stone, red, orange, amber, yellow, green, teal, cyan, blue, indigo, violet, purple, fuchsia, pink, rose)
- Pattern: `(text|bg|border|ring|fill|stroke|shadow|divide|outline|placeholder|decoration|accent|caret)-(<color-name>)-<shade>`
- Example violations: `text-gray-500`, `bg-blue-600`, `border-zinc-300`, `text-slate-700`

**Raw `white` / `black` Tailwind utilities without opacity modifier**
- Example violations: `bg-white`, `text-black`, `border-white` — these ignore dark mode

**Inline `style` with color properties**
- Example violations: `style={{ color: 'gray' }}`, `style={{ backgroundColor: 'rgb(...)' }}`

### Step 3 — Map violations to the correct token

For each violation found, identify the correct replacement from the token set defined in `frontend/app/globals.css`:

| Intent | Correct token |
|---|---|
| Page background | `var(--color-surface-page)` |
| Card / panel background | `var(--color-surface)` |
| Subtle background | `var(--color-surface-subtle)` |
| Inner background (code blocks, inputs) | `var(--color-surface-inner)` |
| Primary border | `var(--color-border)` |
| Inner / divider border | `var(--color-border-inner)` |
| Headings | `var(--color-text-heading)` |
| Body text | `var(--color-text-body)` |
| Caption / metadata | `var(--color-text-caption)` |
| Muted / placeholder | `var(--color-text-muted)` |
| Monospace / code | `var(--color-text-mono)` |
| Primary action | `var(--color-brand)` |
| Hover action | `var(--color-brand-hover)` |
| Active action | `var(--color-brand-active)` |
| Disabled action | `var(--color-brand-disabled)` |
| Focus ring | `var(--color-brand-ring)` |
| Error / danger | `var(--color-danger)` |
| Danger cell highlight | `var(--color-danger-cell)` |
| Success | `var(--color-success)` |
| Success cell highlight | `var(--color-success-cell)` |

In Tailwind v4 (this project uses `@import "tailwindcss"` in `globals.css`), arbitrary CSS variable values are written as:
- `text-[var(--color-text-body)]`
- `bg-[var(--color-surface)]`
- `border-[var(--color-border)]`

### Step 4 — Report findings

Produce a structured report with three sections:

**Violations** — list each occurrence as:
```
<file>:<line>  |  <violation text>  →  <suggested token>
```

**No-issue files** — list files scanned with zero violations.

**Approved exceptions** — any color that is intentionally hardcoded for a reason unrelated to theming (e.g., a logo SVG fill, a brand-specific data visualization palette). These require an inline comment `{/* design-token-audit: intentional */}` to suppress future flags.

### Step 5 — Apply fixes (if instructed)

If the user asks to fix violations (not just report), apply the replacements from Step 3 directly to the source files. Do not change any logic, layout, or spacing — only color-related class names and style values.

After editing, re-run the scan mentally to confirm no violations remain.

### Quality Gate
- [ ] All `.tsx` files changed on the branch have been scanned
- [ ] Zero unresolved `text-<color>-<shade>` or `bg-<color>-<shade>` violations
- [ ] Zero hardcoded hex values in `className` or `style` attributes
- [ ] Every `bg-white` / `text-black` replaced with the appropriate token
- [ ] Approved exceptions are documented with `{/* design-token-audit: intentional */}`
- [ ] Dark mode renders correctly for all changed components (verify by toggling `html.dark` class in `frontend/app/globals.css`)
