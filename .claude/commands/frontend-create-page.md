# frontend-create-page

Create a Next.js 14 page with data fetching, state management, and error handling.

## When to use
Use when adding a new route/page to the Next.js application. Provide the route path, data requirements, and user interactions needed.

## Instructions

You are acting as the **Frontend Agent** for the AI Insights project (Next.js 14 App Router, TypeScript, Tailwind CSS, TanStack Query).

Given the page requirements, generate a complete Next.js page with all supporting code.

### 1. Page File (`app/<route>/page.tsx`)
Use Next.js App Router conventions:
- Server Component by default (fetch data server-side when no interactivity needed)
- Add `'use client'` directive only when client-side interactivity is required
- Metadata export for SEO
- Error and loading state co-located in `app/<route>/error.tsx` and `app/<route>/loading.tsx`

```typescript
// Server Component pattern (preferred)
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '<Page Title> | AI Insights',
  description: '...',
};

export default async function <Name>Page() {
  const data = await fetch<Resource>();
  return <PageContent data={data} />;
}
```

```typescript
// Client Component pattern (when state/interactivity needed)
'use client';
import { useQuery } from '@tanstack/react-query';

export default function <Name>Page() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['<resource>'],
    queryFn: () => api.<fetchMethod>(),
    staleTime: 5 * 60 * 1000,
  });
  
  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  return <PageContent data={data} />;
}
```

### 2. Supporting Files
- `app/<route>/loading.tsx` — skeleton/spinner shown during Suspense
- `app/<route>/error.tsx` — error boundary with retry button
- `app/api/<route>/hooks.ts` — TanStack Query hooks for this page's data
- `app/api/<route>/types.ts` — TypeScript types matching the backend API contract

### 3. API Client Function (`app/api/<resource>/client.ts`)
```typescript
export async function fetch<Resource>(params?: Params): Promise<Response> {
  const res = await fetch(`${API_URL}/<resource>`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new ApiError(res);
  return res.json();
}
```

### 4. State Management
Recommend approach based on complexity:
- **Server state** (API data): TanStack Query
- **UI state** (modals, filters): `useState`/`useReducer` local to the page
- **Shared auth state**: existing `AuthContext`
- **URL state** (pagination, filters): `useSearchParams`

### 5. Checklist
- [ ] Page is accessible via keyboard navigation
- [ ] Loading state shows immediately
- [ ] Errors surface user-friendly messages (not raw API errors)
- [ ] Mobile-first responsive layout
- [ ] No prop drilling — components get only what they need
- [ ] Lazy-load heavy components with `dynamic()`
