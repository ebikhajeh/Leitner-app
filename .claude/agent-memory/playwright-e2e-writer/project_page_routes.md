---
name: Page & Route Map
description: All known app routes, auth requirements, and key UI landmarks for locating elements
type: project
---

## Routes

| Path | Component | Auth Required | Notes |
|---|---|---|---|
| `/login` | `LoginPage` | No (redirects to `/` if authed) | PublicOnlyRoute |
| `/` | `HomePage` | Yes | ProtectedRoute |
| `/words/new` | `AddWordPage` | Yes | ProtectedRoute |
| `*` | — | — | Redirects to `/` |

## HomePage landmarks
- Heading: `getByRole("heading", { name: /welcome back/i })` — note the `<p>` says "Welcome back to your deck"; the `<h1>` says `"Hello, {name}"`
- Sign-out: `page.getByRole("button", { name: /sign out/i })` — actually aria-label="Sign out" icon button; `getByLabel("Sign out")` or `getByRole("button", { name: /sign out/i })` both work

## LoginPage landmarks
- Email field: `getByLabel("Email")` (shadcn Label + Input with associated htmlFor/id)
- Password field: `getByLabel("Password")`
- Submit: `getByRole("button", { name: /sign in/i })`
- Validation errors: `getByText(/enter a valid email address/i)`, `getByText(/password is required/i)` as `<p class="text-destructive text-xs">`
- Server error: `locator("p.text-destructive.text-sm")`

## BottomNav
- Rendered only when authenticated (`{authed && <BottomNav />}` in AppShell)
- Five items: Home, Review, Practice, Add, Stats
- Located by `getByRole("button", { name: /^<label>$/i })`
- Active item has class `text-blue-500`
- "Add" navigates to `/words/new`; Review, Practice, Stats all navigate to `/` (placeholder)
- Active key logic: `/words/new` → `addword`; `/` → `dashboard`
