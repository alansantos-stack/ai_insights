# Dark Theme + Toggle Menu — Implementation Plan

## Problem with Current Token Setup

Design tokens are hardcoded inside `@theme inline { }`:

```css
@theme inline {
  --color-surface-page: #f9fafb; /* ← static, compiled at build time */
}
```

Tailwind v4's `@theme inline` with raw hex values are **resolved at build time** — they cannot be overridden by a `.dark` class at runtime. To support runtime theme switching, the actual color values must live in `:root` (and be re-declared in `html.dark`), not in `@theme inline`.

Since all components already use `bg-[var(--color-surface-page)]` (raw CSS variable references via Tailwind arbitrary syntax), the `@theme inline` entries for these tokens are unused by Tailwind's utility system — they can be safely removed, and the variables can live entirely in `:root`.

---

## Architecture

### Theme switching mechanism
- `html.dark` class on the `<html>` element controls the active theme.
- `localStorage` persists the user's choice across sessions.
- A `ThemeProvider` React context (client component) manages the state and applies the class to `document.documentElement`.
- A `ThemeToggle` button reads from context and calls `toggle()`.

### Flash of unstyled content (FOUC)
- Handled by adding `suppressHydrationWarning` to `<html>` in `layout.tsx` (already present on `<body>`).
- Server renders with no `dark` class; client hydrates and applies it. Brief flash is acceptable for this MVP.

---

## Dark Theme Token Values

| Token | Light | Dark |
|---|---|---|
| `--color-surface-page` | `#f9fafb` | `#09090b` |
| `--color-surface` | `#ffffff` | `#18181b` |
| `--color-surface-subtle` | `#f9fafb` | `#27272a` |
| `--color-surface-inner` | `#f3f4f6` | `#3f3f46` |
| `--color-border` | `#e5e7eb` | `#3f3f46` |
| `--color-border-inner` | `#f3f4f6` | `#27272a` |
| `--color-text-heading` | `#111827` | `#fafafa` |
| `--color-text-body` | `#374151` | `#d4d4d8` |
| `--color-text-caption` | `#6b7280` | `#a1a1aa` |
| `--color-text-muted` | `#9ca3af` | `#71717a` |
| `--color-text-mono` | `#1f2937` | `#e4e4e7` |
| `--color-brand` | `#2563eb` | `#3b82f6` |
| `--color-brand-hover` | `#1d4ed8` | `#2563eb` |
| `--color-brand-active` | `#1e40af` | `#1d4ed8` |
| `--color-brand-disabled` | `#93c5fd` | `#1e3a8a` |
| `--color-brand-ring` | `#3b82f6` | `#60a5fa` |
| `--color-danger` | `#b91c1c` | `#f87171` |
| `--color-danger-cell` | `#ef4444` | `#f87171` |
| `--color-success` | `#15803d` | `#4ade80` |
| `--color-success-cell` | `#22c55e` | `#4ade80` |

---

## Files to Create

### `frontend/app/components/ThemeProvider.tsx`
Client component. Exports:
- `ThemeProvider` — wraps children, manages `theme` state, syncs class on `<html>` and `localStorage`
- `useTheme()` — hook, throws if used outside provider

```
type Theme = 'light' | 'dark'
Context shape: { theme: Theme; toggle: () => void }
```

Initial state: `'light'` (safe for SSR). On mount, reads `localStorage.getItem('theme')` and applies it.
On theme change: `document.documentElement.classList.toggle('dark', theme === 'dark')` + `localStorage.setItem('theme', theme)`.

### `frontend/app/components/ThemeToggle.tsx`
Client component. Uses `useTheme()`. Renders a `<button>` with:
- Sun icon (☀) when dark mode is active (click → switch to light)
- Moon icon (☽) when light mode is active (click → switch to dark)
- `aria-label="Toggle dark mode"`
- Styled with token classes: `text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]`

### `frontend/app/components/AppHeader.tsx`
Client component (needs `useTheme` for re-render on toggle). Renders the top navigation bar:
```
┌─────────────────────────────────────────────────┐
│  AI Insights Dashboard            [☽ Dark mode] │
│  Insights generated on the 1st of each month.   │
└─────────────────────────────────────────────────┘
```
Styled with:
- `bg-[var(--color-surface)] border-b border-[var(--color-border)]` — sticky top bar
- Contains the `<ThemeToggle />` button on the right

---

## Files to Modify

### `frontend/app/globals.css`

**Remove** all design token hex values from `@theme inline` (the entries added in the previous task).

**Add** `:root { }` block with all light values.

**Add** `html.dark { }` block with all dark values.

Keep `@theme inline` only for the existing `--color-background`, `--color-foreground`, `--font-sans`, `--font-mono` entries (untouched).

Final structure:
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;

  /* Design tokens — light */
  --color-surface-page: #f9fafb;
  /* ... all 20 light values ... */
}

html.dark {
  --background: #0a0a0a;
  --foreground: #ededed;

  /* Design tokens — dark */
  --color-surface-page: #09090b;
  /* ... all 20 dark values ... */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  /* No design tokens here anymore */
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

### `frontend/app/layout.tsx`
- Import and wrap `<body>` children with `<ThemeProvider>`.
- Add `suppressHydrationWarning` to `<html>` tag (prevents React warning when `dark` class is added client-side after SSR).

### `frontend/app/page.tsx`
- Remove the inline `<header>` block (title + subtitle paragraph).
- Import `<AppHeader />` and render it above the `<main>` (or make it part of layout — keep in `page.tsx` for now since it's the only page).
- Remove `bg-[var(--color-surface-page)]` from the outer div (the `body` already sets the background via `var(--background)`, or keep it — either is fine).

---

## Execution Order

1. `globals.css` — restructure tokens into `:root` / `html.dark` (no component changes yet; verify visually nothing breaks in light mode)
2. `ThemeProvider.tsx` — create context
3. `ThemeToggle.tsx` — create toggle button
4. `AppHeader.tsx` — create header with toggle
5. `layout.tsx` — wrap with ThemeProvider, add suppressHydrationWarning to html
6. `page.tsx` — replace inline header with `<AppHeader />`

TypeScript check after all edits: `npx tsc --noEmit`.
