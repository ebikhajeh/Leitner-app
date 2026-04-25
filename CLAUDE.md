# Leitner App — Claude Code Project Config

## Stack
- **Runtime**: Bun
- **Backend**: Express 5 + TypeScript (`server/`)
- **Frontend**: React 19 + Vite + TypeScript (`client/`)
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Auth**: Better Auth (session-based, httpOnly cookie)
- **UI**: shadcn/ui (style: `base-nova`, neutral base color, CSS variables, Tailwind v4)
- **AI**: Vercel AI SDK (`ai`, `@ai-sdk/openai`) + OpenAI — server-side only; **not** the Anthropic SDK

## Project Structure
```
server/   ← Bun + Express REST API (port 3000 dev, 3001 test)
client/   ← React + Vite SPA (port 5173 dev / 5174 test, proxies /api to server)
shared/   ← TypeScript modules shared between server and client (wordValidation.ts)
e2e/      ← Playwright E2E tests and global setup/teardown
```

Each app has its own `node_modules` — they are not a Bun workspace.

### Server layout
```
server/src/
  routes/       ← one file per resource (words.ts, generate.ts, dashboard.ts, settings.ts, stats.ts)
  controllers/  ← one file per resource (wordsController.ts, settingsController.ts)
  lib/          ← auth.ts, openai.ts (singleton), validateWord.ts (re-export of @shared),
                   wordService.ts, wordSchemas.ts, reviewScheduler.ts,
                   dashboardService.ts, dashboardConfig.ts,
                   settingsService.ts, settingsSchemas.ts,
                   statsService.ts
  middleware/   ← requireAuth.ts, validate.ts
  types/        ← express.d.ts (augments Express.Locals)
```

### Client layout
```
client/src/
  pages/          ← thin route-level orchestrators (HomePage.tsx, AddWordPage.tsx,
                     ReviewPage.tsx, SettingsPage.tsx, StatsPage.tsx)
  features/       ← co-located feature components + types (add-word/, review/, dashboard/,
                     settings/, stats/)
  hooks/          ← custom React hooks (useGenerateWord.ts, useDueWords.ts,
                     useReviewWord.ts, useReviewSession.ts, useDashboard.ts,
                     useSettings.ts, useSettingsForm.ts, useStats.ts)
  components/ui/  ← shadcn components (includes slider.tsx, switch.tsx)
  config/         ← app-wide constants (languages.ts)
  lib/            ← utilities (api.ts, auth-client.ts, getApiErrorMessage.ts)
```

## Path Aliases
- `@/` → `client/src/` (tsconfig + vite.config.ts)
- `@shared/*` → `../shared/*` (both tsconfigs + vite alias)
- Vite `server.fs.allow: [".."]` is required to serve files from `shared/`
- `server/tsconfig.json` has **no `rootDir`** (removed — it blocked cross-directory imports from `shared/`)

## Documentation
Use the **context7 MCP server** to fetch up-to-date docs before working with any library in this project. Always resolve the library ID first, then query for the relevant topic.

Key libraries to look up via context7:
| Library | context7 ID |
|---|---|
| Bun | `/oven-sh/bun` |
| Express | `/expressjs/express` |
| Vite | `/websites/vite_dev` |
| React | resolve via `mcp__context7__resolve-library-id` |
| Prisma | `/websites/prisma_io` |
| TanStack Query | resolve via `mcp__context7__resolve-library-id` |
| shadcn/ui | `/shadcn-ui/ui` |

## Dev Commands
```bash
bun run dev:server        # start Express (server/)
bun run dev:client        # start Vite (client/)
bun run test:e2e          # run Playwright E2E tests (headless)
bun run test:e2e:ui       # run Playwright E2E tests (UI mode)
cd client && bun run test        # run component tests (single pass)
cd client && bun run test:watch  # run component tests (watch mode)
```

## Component Tests

Component tests live next to their source files as `<Component>.test.tsx` and run via **Vitest** inside the `client/` app.

### Framework & config
- **Runner**: Vitest (`client/vite.config.ts` → `test: { globals: true, environment: "jsdom" }`)
- **Setup file**: `client/src/test/setup.ts` — imports `@testing-library/jest-dom` matchers and exports shared helpers
- **TypeScript**: `"vitest/globals"` is in `client/tsconfig.json` `types` so `vi`, `describe`, `it`, `expect` are available without imports

### Shared test utilities (`client/src/test/`)
| File | Export | Purpose |
|---|---|---|
| `setup.ts` | `setupUser()` | Returns a `userEvent.setup()` instance — use in every test that simulates user input |
| `renderWithProviders.tsx` | `renderWithProviders(ui)` | Wraps `render()` with a fresh `QueryClient` (mutations: no retry) — use for any page that calls `useMutation` or `useQuery` |

`renderWithProviders` only disables mutation retries. For pages that use `useQuery` and need to test error states, create a local render helper with a `QueryClient` that disables **both** query and mutation retries:
```ts
function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}><MyPage /></QueryClientProvider>);
}
```

### Conventions
- Test files sit beside the component: `src/pages/AddWordPage.test.tsx`
- Mock `@/lib/api` with `vi.mock("@/lib/api", () => ({ default: { post: vi.fn(), get: vi.fn(), patch: vi.fn() } }))` — never make real HTTP calls
- Route `api.post` by URL using a `mockPost({ words: ..., generateWord: ... })` helper so save and AI flows are clearly separated
- For pages using `useQuery`, mock `api.get` with `mockResolvedValue` / `mockResolvedValueOnce` per test
- Mock `framer-motion` to strip animation props and render plain `<div>` — avoids jsdom animation warnings; include the `exit` prop in the stripped set
- Mock `sonner` toast to assert calls without rendering the Toaster
- Use `vi.clearAllMocks()` in `beforeEach`; set up default `mockResolvedValue` for patch/mutations in `beforeEach` too
- Prefer `screen.findBy*` (async) after user interactions that trigger state updates
- Find nav buttons (no aria-label) by filtering `getAllByRole("button")` with `.closest("selector")` rather than by text or index

### What to test
- Loading state: skeleton/spinner visible before query resolves
- Error state: error message shown when query rejects (requires `retry: false` on QueryClient)
- Empty state: correct message when API returns empty list
- Initial render: key elements present, buttons disabled in empty state
- Button enable/disable logic driven by form field values
- Form validation errors (Zod schema enforcement)
- Mutation flows: pending state, success (toast + reset), server error display and clearing
- Hook-driven flows: AI generation success, failure, and loading state
- UI interactions: collapsible panels, conditional rendering, mode toggles
- Session complete: shown after last item rated; singular/plural copy; re-entry button present

### Controlled input gotcha
`userEvent.clear` + `userEvent.type` on a React-controlled `<input>` does not reliably reset the value — the component re-renders with the old state before typing begins, so characters are appended to the previous value. Use `fireEvent.change(input, { target: { value: "45" } })` instead to directly trigger the `onChange` handler.

## E2E Tests

Use the **`playwright-e2e-writer`** agent to write all Playwright tests. Never write tests directly — always delegate to this agent.

Trigger it when:
- A new page or feature is implemented and needs E2E coverage
- The user asks for tests on a recently built flow
- Auth, navigation, or form behavior needs verification

The agent has full knowledge of the test infrastructure (ports, credentials, setup/teardown pipeline, locator strategy, and auth handling). Do not repeat that context when invoking it — just describe what feature needs testing.

### Test environment wiring
- `playwright.config.ts` reads `server/.env.test` via dotenv and spreads all vars into the server webServer `env` option — this is what causes the test server to use the test DB and correct `CLIENT_URL`, not `NODE_ENV=test` alone
- `client/.env.test` sets `VITE_API_URL=http://localhost:5174` so the Better Auth client routes through the Vite proxy (→ port 3001) instead of hitting the dev server directly
- `server/.env.test` must contain all required server env vars: `DATABASE_URL`, `PORT`, `CLIENT_URL`, `BETTER_AUTH_SECRET`, `DB_PROVIDER`

### Test infrastructure
- Express test server: port **3001** (dev is 3000)
- Vite test client: port **5174** (dev is 5173), run with `--mode test`
- Playwright `baseURL`: `http://localhost:5174`
- Test database: `leitner_test` (dev is `leitner2`)

### Global setup (`e2e/global-setup.ts`)
1. `server/src/db-ensure.ts` — creates `leitner_test` DB if missing
2. `bun prisma migrate deploy` — applies pending migrations to test DB
3. `bun src/seed.ts` — creates test user (idempotent)

### Global teardown (`e2e/global-teardown.ts`)
Truncates `User`, `Session`, `Account`, `Verification` with `CASCADE`. Leaves schema intact.

### Test credentials
- Email: `test@leitner.local` | Password: `TestPassword123!`
- Defined in `server/.env.test` as `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`

## Authentication

The app uses **Better Auth** with email/password and session cookies.

### Server (`server/`)
- **Config**: `src/lib/auth.ts` — initialises `betterAuth` with the Prisma adapter, `emailAndPassword` enabled, and `trustedOrigins` from `CLIENT_URL`
- **Route**: `app.all("/api/auth/{*any}", toNodeHandler(auth))` in `src/index.ts` — must be registered **before** `express.json()`
- **Guard middleware**: `src/middleware/requireAuth.ts` — calls `auth.api.getSession()`, returns 401 if no session, otherwise sets `res.locals.user` and `res.locals.session`
- **Types**: `src/types/express.d.ts` augments `Express.Locals` so `res.locals.user` and `res.locals.session` are fully typed via `typeof auth.$Infer.Session`

Protect any route by adding `requireAuth` as middleware:
```ts
app.get("/api/some-route", requireAuth, (req, res) => { ... });
```

### Client (`client/`)
- **Auth client**: `src/lib/auth-client.ts` — created with `createAuthClient({ baseURL: import.meta.env.VITE_API_URL })`
- **Exports**: `useSession`, `signIn`, `signOut` — import directly from `@/lib/auth-client`
- **Sign in**: `signIn.email({ email, password }, { onSuccess, onError })`
- **Session hook**: `useSession()` returns `{ data, isPending }` — `data.user` is the authenticated user

### Required env vars
| Var | Where | Purpose |
|---|---|---|
| `CLIENT_URL` | server | Allowed CORS origin + trusted origin for Better Auth |
| `DB_PROVIDER` | server | Prisma adapter provider (e.g. `postgresql`) |
| `BETTER_AUTH_SECRET` | server | Secret for signing sessions — validated at startup |
| `VITE_API_URL` | client | Base URL for the Better Auth client |

## Security

### Patterns in place — do not revert
- **`/api/me`** returns only `{ user: { id, name, email, image } }` — the session object (which contains the raw token) is intentionally excluded
- **Startup validation** — `server/src/lib/auth.ts` throws if `CLIENT_URL`, `DB_PROVIDER`, or `BETTER_AUTH_SECRET` are missing
- **Rate limiting** — `express-rate-limit` on `/api/auth` in production only (20 req / 15 min); registered before the Better Auth handler in `server/src/index.ts`

### Known remaining recommendations (not yet applied)
- Add `helmet` middleware for security headers
- Make `res.locals.user` / `res.locals.session` optional in `server/src/types/express.d.ts`
- Map Better Auth error codes to generic user-facing strings in the login form (prevents user enumeration)

## Data Models

### Word
```prisma
model Word {
  id              String    @id @default(cuid())
  word            String
  meaning         String
  exampleSentence String?
  createdAt       DateTime  @default(now())
  box             Int       @default(1)
  nextReviewAt    DateTime  @default(now())
  lastReviewedAt  DateTime?
  reviewCount     Int       @default(0)
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- `box` is the Leitner level (1–6), mapping to intervals `[1, 3, 7, 14, 30, 60]` days
- `nextReviewAt` is stored as UTC midnight of the target day
- `lastReviewedAt` and `reviewCount` are informational — not used for scheduling

### UserSettings
```prisma
model UserSettings {
  id               String  @id @default(cuid())
  userId           String  @unique
  user             User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  dailyReviewLimit Int     @default(20)
  dailyDueCards    Int?
  autoSave         Boolean @default(false)
}
```

- `dailyReviewLimit` — hard cap on total cards per review session (default 20)
- `dailyDueCards` — max previously-reviewed cards in a session; `null` = unlimited (defaults to 10 if no record exists)
- `autoSave` — when true, each settings change triggers an immediate PATCH (debounced 400 ms for sliders)
- Row is created lazily on first save; `getSettings()` returns in-memory defaults if no row exists yet

## API Routes

Routes are split into dedicated files under `server/src/routes/` and mounted in `server/src/index.ts`.

| Method | Path | File | Auth | Description |
|---|---|---|---|---|
| GET | `/api/health` | `index.ts` | No | Health check |
| GET | `/api/me` | `index.ts` | Yes | Current user profile |
| GET | `/api/words` | `routes/words.ts` | Yes | List all words for the user |
| GET | `/api/words/due` | `routes/words.ts` | Yes | Words due for review (`nextReviewAt <= now`) |
| POST | `/api/words` | `routes/words.ts` | Yes | Save a new word |
| PATCH | `/api/words/:id/review` | `routes/words.ts` | Yes | Submit difficulty rating, advance Leitner box |
| POST | `/api/generate-word` | `routes/generate.ts` | Yes | AI-generate meaning + example |
| GET | `/api/dashboard` | `routes/dashboard.ts` | Yes | Gamification stats for the home dashboard |
| GET | `/api/settings` | `routes/settings.ts` | Yes | Get user settings (returns defaults if no row exists) |
| PATCH | `/api/settings` | `routes/settings.ts` | Yes | Partial update; upserts on first save |
| DELETE | `/api/settings` | `routes/settings.ts` | Yes | Reset to defaults |
| GET | `/api/stats` | `routes/stats.ts` | Yes | Learning progress stats (totals, Leitner distribution, weekly activity) |

To add a new resource, create `server/src/routes/<resource>.ts`, export a Router, and mount it with `app.use("/api/<resource>", router)` in `index.ts`.

### Server architecture pattern

Route → validate middleware → controller → service → DB

```
routes/words.ts          ← declarative: requireAuth, validate(schema), controller fn
middleware/validate.ts   ← validate(schema) parses req.body with Zod; returns first error as { message }
controllers/wordsController.ts  ← reads req/res, calls service, sends response
lib/wordService.ts       ← all Prisma queries; no Express types
lib/wordSchemas.ts       ← Zod schemas (createWordSchema, reviewWordSchema)
```

**`validate.ts` middleware**: wraps a Zod schema, parses `req.body`, replaces it with the parsed result, or returns `400 { message }` on first error. Never do inline Zod parsing in a controller.

**`wordService.ts`** exports: `getWordsByUser`, `getDueWords`, `createWord`, `reviewWord`. The `reviewWord` function calls `scheduleNextReview` and updates `box`, `nextReviewAt`, `lastReviewedAt`, and increments `reviewCount`.

**`getDueWords` session loading**: fetches user settings, then runs two separate queries — up to `dueLimit` previously-reviewed cards (ordered by `nextReviewAt asc`) + up to `(reviewLimit − dueCount)` new cards (`lastReviewedAt IS NULL`, ordered by `createdAt asc`). Due cards always come first. When `dailyDueCards` is `null` the entire `reviewLimit` budget goes to due cards.

**`settingsService.ts`** exports: `getSettings`, `upsertSettings`, `resetSettings`. `getSettings` returns the DB row or in-memory defaults without writing — the row is only created on the first `upsertSettings` call.

**`statsService.ts`** exports: `getStats(userId)`. Does a single Prisma query + one in-memory pass to compute `totalWords`, `mastered`, `retention`, `sessions`, `leitnerBoxes`, and `weeklyActivity`. No separate DB queries per metric — all derived from the same `words` array. See Feature Architecture — Stats for metric definitions.

**`reviewScheduler.ts`** (`server/src/lib/`): pure function `scheduleNextReview(currentLevel, difficulty)` → `{ box, nextReviewAt }`. Uses UTC date arithmetic (`setUTCHours(0,0,0,0)` + `setUTCDate`) so scheduling is timezone-independent. Levels map to intervals `[1, 3, 7, 14, 30, 60]` days.

## Shared Validation (`shared/wordValidation.ts`)

Single source of truth for word validation used by both frontend and backend. Import via `@shared/wordValidation`.

```ts
export const MAX_WORD_LENGTH = 60;
export const PROMPT_VERBS = [...];      // write, tell, explain, give me, list, …
export const PROMPT_TARGETS = [...];    // a, an, the, me, us, my, …
export const PROMPT_PATTERN: RegExp;    // ^(verb)\s+(target)\b
export function isPromptLike(value: string): boolean;
export function validateWordInput(value: string): { ok: true } | { ok: false; message: string };
```

- `server/src/lib/validateWord.ts` is a one-liner re-export of `validateWordInput` for backward compat
- **Never redefine these rules inline** in a route or schema — always import from `@shared`

## AI Word Generation

### Route: `server/src/routes/generate.ts`
- POST `/api/generate-word` — protected by `requireAuth`
- Validates input with `validateWordInput` before calling AI
- Uses Vercel AI SDK `generateObject` with the `openai` singleton from `server/src/lib/openai.ts`
- Model: `gpt-5.4-nano` (user-configured — verify this is a valid model ID if errors occur)
- Returns `{ meaning: string, exampleSentence: string }`
- Wrapped in try/catch; returns `{ message }` on failure

### Prompt logic (`buildGenerateWordPrompt`)
1. **Output language detection** (`detectOutputLanguage`): checks Unicode script ranges via `LANGUAGE_SCRIPT_PATTERNS`
   - If input already matches the target language's script → output in English
   - Otherwise → output in `targetLanguage`
2. **Input type**: `isPhrase = word.includes(" ")`
   - Phrase → return translation of the full phrase in output language
   - Single word → return English definition + translation in output language

### OpenAI singleton
`server/src/lib/openai.ts` re-exports `openai` from `@ai-sdk/openai` at module level. Never instantiate inside a request handler.

### Client hook: `client/src/hooks/useGenerateWord.ts`
Returns: `{ targetLanguage, setTargetLanguage, isGenerating, aiError, hasGenerated, generate, resetGenerated }`
- `generate(word, onSuccess)` — POSTs to `/api/generate-word`, calls `onSuccess({ meaning, exampleSentence })`
- `hasGenerated` — signals AddWordForm to apply `aiInputClass` (blue-tinted border) to filled fields
- `resetGenerated()` — call after a word is saved to reset blue styling

## Frontend Architecture

### App Shell (`client/src/App.tsx`)
- `QueryClientProvider` wraps the entire app (TanStack Query)
- `AppShell` reads `useSession()` once — single session check, no per-route re-fetch
- `ProtectedRoute` helper redirects to `/login` if unauthenticated
- `BottomNav` renders once as a persistent sibling to route content (not inside route elements)

### Pages & Routes
| Path | Component | Protected |
|---|---|---|
| `/login` | `LoginPage` | No (redirects to `/` if authed) |
| `/` | `HomePage` | Yes |
| `/words/new` | `AddWordPage` | Yes |
| `/review` | `ReviewPage` | Yes |
| `/settings` | `SettingsPage` | Yes |
| `/stats` | `StatsPage` | Yes |

### Navigation
- **Bottom navigation bar** (`client/src/components/BottomNav.tsx`) — fixed, 5 items (Home, Review, Stats, Add, Settings)
- Active item derived from `useLocation()` — no props needed
- Active color: `text-blue-500`; inactive: `text-muted-foreground`
- Stats (`BarChart2` icon) navigates to `/stats` (live — replaced the old Practice placeholder)
- Settings navigates to `/settings` (live)

### HTTP Client
- **Axios instance**: `client/src/lib/api.ts` — `baseURL: "/api"`, `withCredentials: true`
- Use `api` for all API calls (not raw `fetch`)
- Use **TanStack Query** `useMutation` for writes, `useQuery` for reads
- **Error helper**: `client/src/lib/getApiErrorMessage.ts` — extracts `response.data.message` or returns a fallback string; use this everywhere instead of inline Axios error parsing

### Toasts
- **Sonner** `<Toaster position="bottom-center" />` mounted in `App.tsx`
- Success toasts: `toast.success(msg, { style: { background: "white", color: "#16a34a" }, classNames: { icon: "text-green-600" } })`

## Feature Architecture — Dashboard (Home)

`HomePage` is a thin orchestrator. All feature components live under `client/src/features/dashboard/`.

```
client/src/
  pages/HomePage.tsx                    ← orchestrator: useDashboard, useSession, layout
  features/dashboard/
    types.ts                            ← DashboardStats interface
    StreakXpRow.tsx                      ← streak + XP stat cards (side by side)
    LevelCard.tsx                        ← trophy icon, level label, XP progress bar
    TodayProgress.tsx                    ← words reviewed today, cards due, weekly goal bar
  hooks/useDashboard.ts                 ← useQuery for GET /api/dashboard; staleTime 60 s
```

### Server — `dashboardService.ts`
- `getDashboardStats(userId)` — single export; runs two parallel Prisma queries (words + due count)
- **XP**: sum of `reviewCount × XP_PER_REVIEW` across all words
- **Level**: `floor(xp / XP_PER_LEVEL) + 1`; `xpInLevel = xp % XP_PER_LEVEL`
- **Streak**: unique UTC days derived from `lastReviewedAt`; consecutive run ending today or yesterday
- **reviewedToday**: unique cards with `lastReviewedAt >= UTC midnight today` (distinct-card count, not total actions)
- **weeklyReviews**: cards with `lastReviewedAt >= UTC midnight 7 days ago`

### Server — `dashboardConfig.ts`
Tunable gamification constants (`XP_PER_REVIEW`, `XP_PER_LEVEL`, `WEEKLY_GOAL`). Edit here when game-design values change — do not inline them in `dashboardService.ts`.

### Date helpers in `dashboardService.ts`
- `utcDayStart(d)` → `Date` at UTC midnight for the given date
- `utcDayNumber(d)` → integer day index (`utcDayStart(d).getTime() / MS_PER_DAY`)

All date arithmetic uses UTC to match `reviewScheduler.ts`. This means cards become available at 00:00 UTC; users in UTC-minus timezones see cards appear the evening before — this is documented correct behavior.

### HomePage responsibilities
- Calls `useDashboard()` and `useSession()` — no other data fetching
- Renders skeleton placeholders while loading; a retry-able error card on failure
- `getGreeting()` is called inside the component (not at module scope) so it reflects the current hour on each render
- `AnimatedSection` — local helper wrapping `motion.div` with `opacity/y` entrance; accepts `delay` and `y` props

### `useDashboard` query key
`["dashboard"]` — no custom `staleTime`. Invalidated by `useReviewWord` (after rating) and the add-word mutation in `AddWordPage` (after saving), so stats refresh immediately after any action that changes them. If you add a mutation that affects XP, streak, or due count, invalidate `["dashboard"]` in its `onSettled`.

### CSS custom tokens (added for dashboard)
Defined in `client/src/index.css` `@theme inline`:
- `--color-streak` — orange (flame icon, streak card bg tint)
- `--color-xp` — violet (zap icon, XP card bg tint)
- `--color-success` — green (weekly goal progress bar)
- `--color-warning` — amber (trophy icon in LevelCard)
- `--animate-pulse-glow` — blue box-shadow + subtle scale(1.015) pulse on the Start Review CTA; glow color matches `bg-blue-500` so it's visible against the off-white background

## Feature Architecture — Add Word

`AddWordPage` is a thin orchestrator. All feature code lives under `client/src/features/add-word/`.

```
client/src/
  pages/AddWordPage.tsx              ← orchestrator: useForm, FormProvider, useMutation, layout
  features/add-word/
    types.ts                         ← addWordSchema, AddWordFormValues, inputClass, aiInputClass
    AiAssistantPanel.tsx             ← collapsible AI panel (self-contained)
    AddWordForm.tsx                  ← form UI (reads state via useFormContext)
  hooks/useGenerateWord.ts           ← AI generation state machine
  config/languages.ts                ← LANGUAGES array (8 entries: label + flag emoji)
```

### AddWordPage responsibilities
- `useForm<AddWordFormValues>` + `<FormProvider>` — owns the form instance
- `useGenerateWord()` — owns AI generation state
- `useMutation` — owns the save-word API call
- Computes `canSubmit` (word + meaning non-empty) and `canGenerate` (word non-empty + not generating)
- `handleGenerate` — calls `generate()`, then `setValue` for meaning + exampleSentence
- On save success: `reset()`, `resetGenerated()`, focus word input, show success toast

### AddWordForm
- Calls `useFormContext<AddWordFormValues>()` internally — **no form props are passed through**
- Merges RHF word ref with `wordInputRef` via callback ref pattern
- Shows `<Skeleton>` placeholders while `isGenerating`
- Applies `aiInputClass` (blue-tinted) to meaning + exampleSentence when `hasGenerated`

### AiAssistantPanel
- Collapsible, open by default
- Language selector reads from `client/src/config/languages.ts`
- Generate button disabled unless word field has content and `!isGenerating`

## Feature Architecture — Review

`ReviewPage` is a thin UI renderer. All session logic lives in `useReviewSession`; all feature components live under `client/src/features/review/`.

```
client/src/
  pages/ReviewPage.tsx                    ← pure UI renderer; consumes useReviewSession
  hooks/useReviewSession.ts               ← all session state + navigation logic
  hooks/useDueWords.ts                    ← useQuery for GET /api/words/due
  hooks/useReviewWord.ts                  ← useMutation for PATCH /api/words/:id/review;
                                             invalidates ["words","due"] onSettled
  features/review/
    types.ts                              ← ReviewMode, Word interface
    ReviewCard.tsx                        ← card UI; derives promptNode/revealNode from mode
    DifficultyButtons.tsx                 ← Hard / Medium / Easy buttons; accepts isPending
    ShowAnswerButton.tsx                  ← reusable "Show Answer" button (blue-500)
    ReviewModeToggle.tsx                  ← Normal ↔ Reverse toggle; full-width, above progress
    ReviewProgress.tsx                    ← progress bar (blue-500 fill); divide-by-zero safe
    ReviewStates.tsx                      ← ReviewLoadingState, ReviewErrorState,
                                             ReviewNoDueState, ReviewSessionCompleteState,
                                             ReviewEmptyState
```

### Session state pattern (`useReviewSession`)
- `sessionCards: Word[] | null` — initialized once from query cache, then maintained locally; `null` means "not yet initialized"
- `useEffect` guards with `!isFetching` before initializing — prevents stale-cache init when the query is still refetching in background
- `resetSession()` sets `sessionCards = null`; the `useEffect` re-fires after the next fresh fetch completes
- After rating **medium/easy**, the card is immediately removed from `sessionCards` (optimistic local removal); query invalidation from `useReviewWord.onSettled` prepares fresh data for the next session
- After rating **hard**, the card is requeued at the end of `sessionCards` for same-session reinforcement (see below)

### Hard card requeue behavior
- `hardRepeatCounts: Map<string, number>` tracks how many times each card has been requeued this session
- `MAX_HARD_REPEATS = 5` (module-level constant in `useReviewSession.ts`) — a card is requeued up to 5 times; on the 6th hard rating it is removed normally
- On requeue: card is appended to end of `sessionCards` (`[...without, card]`); `currentIndex` is clamped to `Math.max(0, Math.min(i, without.length - 1))` to prevent negative indices when the hard card was the only one
- The backend is still called via `reviewWord` on every hard rating — if the user exits mid-session, the card is already scheduled for 1 day out (the minimum interval)
- `resetSession()` clears `hardRepeatCounts` so a fresh session treats all cards as first-time

### Review session complete screen
`ReviewSessionCompleteState` shows "You reviewed X cards" with two navigation actions:
- **Back to Home** (outline style) — `navigate("/")`
- **Add New Words** (blue-500 style) — `navigate("/words/new")`
The old "Review Again" button was removed — reviewed cards are scheduled to future dates, so restarting immediately shows the "no cards due" state.

### Review modes
- **Normal**: Word → (reveal) → Meaning + example
- **Reverse**: Meaning → (reveal) → Word
- `ReviewCard` derives `promptNode` / `revealNode` from `mode` — single JSX structure, no duplication

### Spaced repetition
- Difficulty "easy" → `box + 1` (max 6); "hard" → `box - 1` (min 1); "medium" → unchanged
- Box levels map to intervals: `[1, 3, 7, 14, 30, 60]` days
- `nextReviewAt` is set to UTC midnight of the target day — scheduling is timezone-independent; users in UTC-offset timezones see cards become available the evening before (correct behavior)

### Color convention — critical
**`--primary` maps to black in this app's neutral theme.** Never use `bg-primary` or `text-primary` for interactive/active UI in the review feature. Always use explicit `blue-500`:
- Active toggle state: `bg-blue-500 text-white`
- Show Answer button: `bg-blue-500 hover:bg-blue-600 text-white`
- Progress bar fill: `bg-blue-500`
- BottomNav active icon: `text-blue-500`
- Difficulty buttons: `bg-destructive text-white` / `bg-amber-400 text-white` / `bg-green-500 text-white` — all use `text-white` (not semantic foreground tokens)

### `useReviewWord` invalidation
`onSettled` (not `onSuccess`) invalidates both `["words","due"]` and `["dashboard"]` — fires even on network errors so neither cache gets stuck stale.

### `useDueWords` query key
`["words", "due"]` — invalidated both by `useReviewWord` (after rating) and by `AddWordPage` save mutation (after adding a new word), ensuring the next session picks up new cards.

## Feature Architecture — Settings

`SettingsPage` is a thin presentational renderer. Logic lives in `useSettingsForm`; API calls live in `useSettings` / `useUpdateSettings` / `useResetSettings`; UI sections live under `client/src/features/settings/`.

```
client/src/
  pages/SettingsPage.tsx                    ← presentational; consumes useSettingsForm, renders sections
  hooks/useSettings.ts                      ← useSettings (GET), useUpdateSettings (PATCH),
                                               useResetSettings (DELETE); shared SETTINGS_QUERY_KEY
  hooks/useSettingsForm.ts                  ← all local state, sync effect, handlers, debounce
  features/settings/
    ReviewLimitSection.tsx                  ← presets + slider + custom input for reviewLimit
    DueCardsSection.tsx                     ← presets (5 / 10 / 15 / All) for dueLimit
    PreferencesSection.tsx                  ← auto-save toggle
```

### `useSettings` hooks
- `SETTINGS_QUERY_KEY = ["settings"] as const` — shared constant used in all three hooks
- `Settings` interface and `UpdateSettingsInput` type are exported for use in `useSettingsForm`
- `useSetSettingsCache()` — private helper; both mutation `onSuccess` callbacks call it to update the cache directly (no refetch)

### `useSettingsForm` internals
- `DEFAULT_SETTINGS` — local constant with initial state values (`reviewLimit: 20`, `dueLimit: 10`, `autoSave: false`)
- `hydrateSettings(settings)` — sets all three state slices from a Settings object; used in the sync `useEffect` and the reset `onSuccess`
- `buildPayload()` — assembles `UpdateSettingsInput` from current state; maps `"all"` → `null` for `dailyDueCards`
- **Auto-save debouncing**: slider/preset changes call `debouncedSave` (400 ms debounce via `useRef` timer) to prevent rapid PATCH requests; the toggle (`handleAutoSaveToggle`) is not debounced — it is a discrete action that always saves immediately
- Timer is cleared on unmount via `useEffect` cleanup

### `SettingsPage` local helpers
- `AnimatedSettingsCard` — local component wrapping `motion.section` with card styling and entrance animation; accepts `delay` and `children`

### SettingsPage component test (`client/src/pages/SettingsPage.test.tsx`)
- Mocks `api` with `{ get, patch, delete }` — `delete` is needed alongside `get`/`patch`
- Mocks `sonner` as `Object.assign(vi.fn(), { success: vi.fn() })` — handles both `toast("…")` and `toast.success("…")` calls
- Mocks `framer-motion` with both `motion.div` and `motion.section` (SettingsPage uses `motion.section` via `AnimatedSettingsCard`)
- Uses `fireEvent.change` for the custom number input (not `userEvent.clear` + `userEvent.type` — see controlled input gotcha above)
- Debounce tests use `waitFor({ timeout: 1000 })` — real timers; the 400 ms debounce fires within the default `waitFor` window

### `dueLimit` "all" convention
- Frontend stores `"all"` as the string sentinel; `buildPayload` converts it to `null` before sending
- Backend stores `null` in `dailyDueCards`; `getSettings` returns `null`; frontend maps `null → "all"` in `hydrateSettings`
- Never store the string `"all"` in the database

## Feature Architecture — Stats

`StatsPage` is a thin orchestrator. All feature components live under `client/src/features/stats/`.

```
client/src/
  pages/StatsPage.tsx                     ← orchestrator: useStats, loading/error/data states
  features/stats/
    types.ts                              ← Stats interface, LeitnerBox interface;
                                             weeklyActivity typed as 7-tuple
    StatCardsGrid.tsx                     ← 2×2 grid of stat cards with icons + number formatting;
                                             StatCardsGridSkeleton exported
    LeitnerBoxesCard.tsx                  ← progress bars for boxes 1–5 with semantic labels
                                             and progressive colors; LeitnerBoxesCardSkeleton exported
    WeeklyActivityCard.tsx                ← Mon–Sun bar chart; zero-count days show a 4px sliver;
                                             WeeklyActivityCardSkeleton exported
  hooks/useStats.ts                       ← useQuery for GET /api/stats; STATS_QUERY_KEY exported
```

### Server — `statsService.ts`
- `getStats(userId)` — single export; one Prisma query + one in-memory aggregation pass
- **Single-pass aggregation**: builds `boxCounts` (Record), `reviewDates` (Date[]), `reviewedCount`, and `progressedCount` in one `for` loop — no repeated `.filter()` passes
- `reviewDates` is shared between `calculateSessions` and `calculateWeeklyActivity`
- `mastered` is derived from `boxCounts` after the loop: `(boxCounts[5] ?? 0) + (boxCounts[6] ?? 0)`

### Metric definitions
- **totalWords**: total word count for the user
- **mastered**: words in box 5 or 6 (both displayed as "Mastered" in the UI; internal scheduling for box 6 at 60-day interval is unchanged)
- **retention**: % of reviewed cards (`reviewCount > 0`) that have progressed past box 1 — proxy for long-term recall success
- **sessions**: unique UTC days on which at least one review occurred (derived from `lastReviewedAt`)
- **leitnerBoxes**: `[{ box, count }]` for boxes 1–5; box 5 count absorbs box 6 (`box >= 5`) — UI shows 5 bars only
- **weeklyActivity**: `[mon, tue, wed, thu, fri, sat, sun]` — cards whose `lastReviewedAt` falls on each day of the current Mon–Sun week

### Leitner box display conventions
- Boxes 1–5 shown; box 6 is absorbed into box 5 at the API layer
- `BOX_LABELS`: `{ 1: "New", 2: "Learning", 3: "Familiar", 4: "Confident", 5: "Mastered" }` — rendered below each "Box N" label
- `BOX_COLORS`: `{ 1: "bg-slate-400", 2: "bg-blue-400", 3: "bg-cyan-500", 4: "bg-green-500", 5: "bg-amber-400" }` — progressive palette; count labels inside bars use `text-white`

### `useStats` query key
`STATS_QUERY_KEY = ["stats"] as const` — exported from `useStats.ts`. Import it in any future mutation that should invalidate stats (e.g. a word deletion feature).

### StatsPage responsibilities
- Calls `useStats()` — no other data fetching
- Shows `*Skeleton` variants while loading; error card with retry button on failure
- Each section (`StatCardsGrid`, `LeitnerBoxesCard`, `WeeklyActivityCard`) receives only the slice of `Stats` it needs

### StatsPage component test (`client/src/pages/StatsPage.test.tsx`)
- Mocks `api` with `{ get: vi.fn() }` only — no mutations on this page
- Mocks `framer-motion` with `motion.div` only (`motion.section` is not used here)
- No `sonner` mock needed — StatsPage has no toasts
- Test data pitfall: avoid values in `mastered` that collide with any `leitnerBoxes[n].count` — duplicate text causes `findByText` to throw "found multiple elements". Use a value that doesn't appear in box counts.
- "Mastered" appears in both the stat cards grid label and as the box 5 sublabel in `LeitnerBoxesCard` — use `getAllByText("Mastered")` to avoid ambiguity
- Retry button test: mock `api.get` to reject once then resolve, then click Retry and assert it was called twice

## Frontend Conventions

### shadcn/ui
- Components live in `client/src/components/ui/`
- Add new components with: `npx shadcn@latest add <name>` (run from `client/`)
- Use `@/` path alias for all imports (e.g. `@/components/ui/button`)
- Theme tokens are CSS variables defined in `client/src/index.css` — always use semantic tokens (`bg-background`, `text-foreground`, `text-destructive`, etc.) rather than hardcoded colors
- Long `className` strings in shadcn wrappers are extracted into named constants at the top of the file
- Custom wrapper components get `.displayName` for React DevTools (skip primitive re-exports where TypeScript disallows it)

### CSS token values — do not revert
- `--background: oklch(0.97 0 0)` — intentionally off-white (not pure white) so cards visually elevate above the page surface
- `--card: oklch(1 0 0)` — pure white; cards must remain lighter than the background
- `--muted: oklch(0.925 0 0)` — intentionally darker than `--background` so `Skeleton` placeholders (`bg-muted`) are visible; do not set equal to `--background`
- All three values must remain distinct; do not collapse any two to the same value

### Interactive elements
- All clickable elements must include `cursor-pointer` so the cursor changes to a hand on hover
- The shadcn `Button` base class already includes `cursor-pointer` — raw `<button>` elements need it added manually

### Layout
- Content pages use `px-5 pt-6 pb-28 max-w-lg mx-auto` — `pb-28` clears the fixed bottom nav
- Cards: `bg-card rounded-2xl border border-border p-5`
- Form labels: raw `<label>` with `text-xs font-semibold text-muted-foreground uppercase tracking-wider`
- Form inputs: raw `<input>` / `<textarea>` — **not** shadcn `<Input>` — styled with `inputClass` / `aiInputClass` constants defined in the feature's `types.ts`

### Forms
- Use **React Hook Form** + **Zod** for all forms
- Schema and inferred type live in the feature's `types.ts`; never define them inline in a page
- For forms with sub-components, use `<FormProvider>` in the page and `useFormContext()` in children — do not prop-drill `register` or `errors`
- Show field errors with `<p className="text-destructive text-xs">` below the input
- Show server errors with `<p className="text-destructive text-sm">` above the submit button
- Wrap mutations in `useMutation` — use `isPending` from the mutation (not RHF's `isSubmitting`) for loading state
- Server error clears when the user edits the relevant field (`onChange: onClearServerError`)
