# Leitner Language Learning App — Implementation Plan

## Phase 1: Project Setup & Infrastructure

**1.1 — Monorepo Initialization**
- Init root `package.json` with workspaces `["client", "server"]`
- Create `.gitignore` (node_modules, .env, dist, Prisma client output)
- Add root dev script using `concurrently` to run both apps with one command

**1.2 — Server Scaffolding**
- `bun init` inside `server/`, install Express, Prisma, Anthropic SDK, bcryptjs, cookie-parser, cors, zod, uuid
- Create `server/src/index.ts` with a health-check route
- Create `server/.env.example` with `DATABASE_URL`, `ANTHROPIC_API_KEY`, `PORT`, `COOKIE_SECRET`, `CLIENT_URL`

**1.3 — Client Scaffolding**
- Scaffold with Vite React-TS template
- Install react-router-dom v7, TanStack Query, axios, zustand, zod, react-hook-form
- Init shadcn/ui, install initial components (button, input, card, form, toast, badge, progress)
- Configure Vite proxy: `/api` → `http://localhost:3000`

**1.4 — Database Setup**
- Create Supabase project, copy connection string to `.env`
- Init Prisma inside `server/` with `postgresql` provider

---

## Phase 2: Database Schema & Server Foundation

**2.1 — Prisma Schema**
- Define all four models (User, Session, Flashcard, ReviewLog) with indexes and cascade deletes
- Run `prisma migrate dev --name init`

**2.2 — Server Folder Structure**
- Create empty files for all routes, middleware, and lib modules

**2.3 — Core Server Middleware**
- Wire up CORS (with credentials), cookieParser, express.json(), route mounts, and a central error handler in `index.ts`

**2.4 — Leitner Pure Logic (`lib/leitner.ts`)**
- Implement `nextBox()` and `nextReviewDate()`
- Write unit tests with Bun's test runner covering all box/difficulty combinations

**2.5 — Auth Middleware (`middleware/requireAuth.ts`)**
- Read session cookie → query DB → 401 or attach `req.user`
- Augment Express `Request` type in `types/express.d.ts`

**2.6 — Validation Middleware (`middleware/validate.ts`)**
- Generic `validate(schema)` factory that runs Zod on `req.body` and returns 400 on failure

---

## Phase 3: Auth API

**3.1** — `POST /register` — hash password, create User + Session, set httpOnly cookie, return user

**3.2** — `POST /login` — verify password, create Session, set cookie

**3.3** — `POST /logout` — delete Session, clear cookie

**3.4** — `GET /me` — return current user (no passwordHash) for client rehydration

---

## Phase 4: Flashcard CRUD API

**4.1** — `POST /api/cards` — create card (box=1, nextReviewAt=now)

**4.2** — `GET /api/cards` — list user's cards, optional `?box=` filter

**4.3** — `PUT /api/cards/:id` — update word/meaning/example (verify ownership)

**4.4** — `DELETE /api/cards/:id` — delete card + cascade ReviewLogs, return 204

---

## Phase 5: Review System API

**5.1** — `GET /api/review/due` — cards where `nextReviewAt <= now`, respects daily new-card limit (counted from ReviewLog)

**5.2** — `POST /api/review/:id` — apply Leitner rules, create ReviewLog, update streak, award XP (Hard=5, Medium=10, Easy=15), recompute level (`Math.floor(xp/100)+1`)

---

## Phase 6: Practice & Stats API

**6.1** — `lib/claude.ts` — wrap Anthropic SDK, call claude-haiku, return structured `{ score, feedback, isCorrect, suggestion }` parsed with Zod

**6.2** — `POST /api/practice/evaluate` — verify card ownership, call Claude, return evaluation (does NOT move card between boxes)

**6.3** — `GET /api/stats` — parallel Prisma queries for totals, per-box counts, retention rate (last 30 days), XP/streak

---

## Phase 7: Settings API

**7.1** — `GET /api/user/settings` — return `{ dailyNewLimit }`

**7.2** — `PUT /api/user/settings` — update `dailyNewLimit` (validated 1–100)

---

## Phase 8: Client Foundation

**8.1** — Create full folder structure (pages/, components/, api/, hooks/, store/, lib/)

**8.2** — `api/client.ts` — Axios instance with `withCredentials: true`, 401 interceptor → redirect to `/login`

**8.3** — `store/authStore.ts` — Zustand store: `user`, `setUser`, `logout()`

**8.4** — `App.tsx` — React Router v7 routes; `ProtectedRoute` checks store, redirects if unauthenticated; on mount calls `GET /me` to rehydrate session

**8.5** — `main.tsx` — wrap in `QueryClientProvider`, add ReactQueryDevtools (dev only)

---

## Phase 9: Auth Pages

**9.1** — `LoginPage.tsx` — react-hook-form + Zod, POST /login, navigate to `/` on success

**9.2** — `RegisterPage.tsx` — same pattern + `confirmPassword` refine check

**9.3** — `AppShell.tsx` — sidebar/nav with links (Dashboard, Review + due-count badge, Practice, Stats, Settings), XP bar, streak badge, logout button

---

## Phase 10: Dashboard & Card Management

**10.1** — `hooks/useCards.ts` — TanStack Query hooks for all card CRUD mutations (invalidate `['cards']` on success)

**10.2** — `DashboardPage.tsx` — due-count overview, cards grouped by box, Add/Edit/Delete card dialogs

---

## Phase 11: Review Flow

**11.1** — `hooks/useReview.ts` — `useDueCards()` query + `useSubmitReview()` mutation (invalidates due-cards, stats, auth/me)

**11.2** — `ReviewPage.tsx` — 4-state machine: `idle → question → revealed → complete`. Progress bar, XP toast on each submission, session summary screen

---

## Phase 12: Practice Page

**12.1** — `hooks/usePractice.ts` — wraps `useMutation` on `/api/practice/evaluate`

**12.2** — `PracticePage.tsx` — pick a card, textarea input, Evaluate button, display score (1–5 stars), feedback text, color-coded result card (green/red border)

---

## Phase 13: Stats Page

**13.1** — `hooks/useStats.ts` — `useQuery` on `/api/stats`

**13.2** — `StatsPage.tsx` — summary row (total words, mastered, retention rate, total reviews), per-box progress bars, XP/level progress, recent activity

---

## Phase 14: Settings Page

**14.1** — Settings form for `dailyNewLimit` (pre-filled, validated 1–100), account email display, success toast on save

---

## Phase 15: Polish & Production Readiness

**15.1** — Error Boundaries wrapping the router outlet; Skeleton loaders on all pages

**15.2** — Standardized toast system (XP gains, CRUD success/error)

**15.3** — Form UX: inline field errors, disabled submit on invalid state, auto-focus first field

**15.4** — Bun dev/start scripts, Vite build scripts, `.env.example` files documented

**15.5** — Manual smoke test checklist: register → review → practice → stats → settings → logout

---

## Dependency Order

```
Phase 1 → Phase 2 → Phases 3–7 (backend, buildable in parallel after Phase 2)
                  → Phase 8 → Phase 9 → Phases 10–14 (one per backend feature)
                                                    → Phase 15
```

Phases 3–7 can be built and tested with Bruno/Insomnia before any frontend work begins.
Each frontend phase (10–14) maps 1:1 to its corresponding backend phase.

---

## Critical Files

| File | Why |
|---|---|
| `server/prisma/schema.prisma` | Everything depends on this — get it right first |
| `server/src/lib/leitner.ts` | Must be correct before Phase 5 |
| `server/src/middleware/requireAuth.ts` | A bug here breaks all protected routes |
| `server/src/routes/review.ts` | Most complex route: Leitner + XP + streak + ReviewLog |
| `client/src/pages/ReviewPage.tsx` | Most stateful component — core UX loop of the app |
