# Design System — AI Insights Dashboard

## Problem

Components were built independently, leading to a visual split:

| Component | Theme applied |
|---|---|
| `page.tsx` | Light (gray-50 background) |
| `InsightCard.tsx` | Light (white card, gray-200 borders) |
| `InsightList.tsx` | Light |
| `TriggerButton.tsx` | Light (blue-600 primary, green-700/red-700 status) |
| `ClientSlaModal.tsx` | **Dark** (gray-900 bg, gray-700 borders, white text) |

The modal visually clashes with the rest of the UI.

---

## Chosen Direction

**Single light theme** — consistent with the majority of the existing UI and the page shell (`bg-gray-50`, white cards, gray text). No dark mode toggle for now.

---

## Design Tokens

Defined in `globals.css` inside the Tailwind v4 `@theme` block, then used throughout components via Tailwind's CSS variable syntax (`bg-[var(--color-surface)]`).

### Surface

| Token | Hex | Tailwind equivalent | Usage |
|---|---|---|---|
| `--color-surface-page` | `#f9fafb` | gray-50 | Page background (`min-h-screen`) |
| `--color-surface` | `#ffffff` | white | Cards, modal panels |
| `--color-surface-subtle` | `#f9fafb` | gray-50 | `<pre>` blocks, table headers |
| `--color-surface-inner` | `#f3f4f6` | gray-100 | Inner code block border-fill |

### Border

| Token | Hex | Tailwind equivalent | Usage |
|---|---|---|---|
| `--color-border` | `#e5e7eb` | gray-200 | Card borders, modal border |
| `--color-border-inner` | `#f3f4f6` | gray-100 | `<pre>` tag border, table row dividers |

### Text

| Token | Hex | Tailwind equivalent | Usage |
|---|---|---|---|
| `--color-text-heading` | `#111827` | gray-900 | `<h1>`, `<h2>`, card dates |
| `--color-text-body` | `#374151` | gray-700 | Paragraph body text |
| `--color-text-caption` | `#6b7280` | gray-500 | Meta text (`Saved …`) |
| `--color-text-muted` | `#9ca3af` | gray-400 | Section labels (QUERY, RESULT) |
| `--color-text-mono` | `#1f2937` | gray-800 | Monospace / code text |

### Brand (Primary Action)

| Token | Hex | Tailwind equivalent | Usage |
|---|---|---|---|
| `--color-brand` | `#2563eb` | blue-600 | Primary button bg, text links |
| `--color-brand-hover` | `#1d4ed8` | blue-700 | Button hover |
| `--color-brand-active` | `#1e40af` | blue-800 | Button active / text link hover |
| `--color-brand-disabled` | `#93c5fd` | blue-300 | Button disabled state |
| `--color-brand-ring` | `#3b82f6` | blue-500 | Focus ring |

### Semantic Status

| Token | Hex | Tailwind equivalent | Usage |
|---|---|---|---|
| `--color-danger` | `#b91c1c` | red-700 | TriggerButton error message text |
| `--color-danger-cell` | `#ef4444` | red-500 | Table cell — positive "over avg" delta |
| `--color-success` | `#15803d` | green-700 | TriggerButton success message text |
| `--color-success-cell` | `#22c55e` | green-500 | Table cell — negative/good delta |

---

## Component Change Map

### `globals.css`
- Add all tokens above inside `@theme inline { … }`.
- Keep existing `--background` / `--foreground` vars; they are unused in component code now.

### `page.tsx`
- `bg-gray-50` → `bg-[var(--color-surface-page)]`
- `text-gray-900` (h1) → `text-[var(--color-text-heading)]`
- `text-gray-500` (subtitle) → `text-[var(--color-text-caption)]`

### `InsightCard.tsx`
- `bg-white` → `bg-[var(--color-surface)]`
- `border-gray-200` → `border-[var(--color-border)]`
- `text-gray-900` → `text-[var(--color-text-heading)]`
- `text-gray-500` → `text-[var(--color-text-caption)]`
- `text-gray-400` (labels) → `text-[var(--color-text-muted)]`
- `text-gray-700` (body) → `text-[var(--color-text-body)]`
- `text-blue-600` / `hover:text-blue-800` (Show more) → `text-[var(--color-brand)]` / `hover:text-[var(--color-brand-active)]`
- `bg-gray-50 border-gray-100 text-gray-800` (pre) → surface/border/mono tokens
- `bg-blue-600 hover:bg-blue-700` (button) → brand tokens
- `focus-visible:ring-blue-500` → `focus-visible:ring-[var(--color-brand-ring)]`

### `InsightList.tsx`
- `text-gray-500` (empty state) → `text-[var(--color-text-caption)]`

### `TriggerButton.tsx`
- `bg-blue-600 hover:bg-blue-700 active:bg-blue-800` → brand tokens
- `bg-blue-300` (disabled) → `bg-[var(--color-brand-disabled)]`
- `focus-visible:ring-blue-500` → `focus-visible:ring-[var(--color-brand-ring)]`
- `text-green-700` → `text-[var(--color-success)]`
- `text-red-700` → `text-[var(--color-danger)]`

### `ClientSlaModal.tsx` — primary fix
Replace all dark-theme classes with light-theme equivalents:

| Current (dark) | Replace with (light token) |
|---|---|
| `bg-gray-900` (modal panel) | `bg-[var(--color-surface)]` |
| `border-gray-700` (panel border, header border-b) | `border-[var(--color-border)]` |
| `bg-gray-800` (th background) | `bg-[var(--color-surface-subtle)]` |
| `text-white` (title, close btn hover) | `text-[var(--color-text-heading)]` |
| `text-gray-400` (th labels, loading text, close btn) | `text-[var(--color-text-muted)]` |
| `hover:text-white` (close btn) | `hover:text-[var(--color-text-heading)]` |
| `text-gray-100` (td body text) | `text-[var(--color-text-body)]` |
| `border-gray-800` (td row dividers) | `border-[var(--color-border-inner)]` |
| `text-red-400` (over avg positive) | `text-[var(--color-danger-cell)]` |
| `text-green-400` (over avg negative) | `text-[var(--color-success-cell)]` |
| `font-mono text-gray-100` (idClient) | `font-mono text-[var(--color-text-mono)]` |
| `text-red-400` (error state) | `text-[var(--color-danger-cell)]` |

---

## Execution Plan

1. **`globals.css`** — Add token definitions under `@theme inline`.
2. **`ClientSlaModal.tsx`** — Replace all dark-theme Tailwind classes (highest priority, root cause of visible mismatch).
3. **`page.tsx`** — Swap raw gray classes for tokens.
4. **`InsightCard.tsx`** — Swap raw gray/blue classes for tokens.
5. **`InsightList.tsx`** — Swap raw gray class for token.
6. **`TriggerButton.tsx`** — Swap raw blue/green/red classes for tokens.

No new files, no new dependencies, no structural changes — only class-name substitutions and one CSS block addition.
