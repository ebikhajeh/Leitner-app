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
  routes/       ← one file per resource (words.ts, generate.ts)
  lib/          ← auth.ts, openai.ts (singleton), validateWord.ts (re-export of @shared)
  middleware/   ← requireAuth.ts
  types/        ← express.d.ts (augments Express.Locals)
```

### Client layout
```
client/src/
  pages/          ← thin route-level orchestrators (AddWordPage.tsx)
  features/       ← co-located feature components + types (add-word/)
  hooks/          ← custom React hooks (useGenerateWord.ts)
  components/ui/  ← shadcn components
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
bun run dev:server      # start Express (server/)
bun run dev:client      # start Vite (client/)
bun run test:e2e        # run Playwright E2E tests (headless)
bun run test:e2e:ui     # run Playwright E2E tests (UI mode)
```

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
  id              String   @id @default(cuid())
  word            String
  meaning         String
  exampleSentence String?
  createdAt       DateTime @default(now())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## API Routes

Routes are split into dedicated files under `server/src/routes/` and mounted in `server/src/index.ts`.

| Method | Path | File | Auth | Description |
|---|---|---|---|---|
| GET | `/api/health` | `index.ts` | No | Health check |
| GET | `/api/me` | `index.ts` | Yes | Current user profile |
| POST | `/api/words` | `routes/words.ts` | Yes | Save a new word |
| POST | `/api/generate-word` | `routes/generate.ts` | Yes | AI-generate meaning + example |

To add a new resource, create `server/src/routes/<resource>.ts`, export a Router, and mount it with `app.use("/api/<resource>", router)` in `index.ts`.

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

### Navigation
- **Bottom navigation bar** (`client/src/components/BottomNav.tsx`) — fixed, 5 items (Home, Review, Practice, Add, Stats)
- Active item derived from `useLocation()` — no props needed
- Active color: `text-blue-500`; inactive: `text-muted-foreground`
- Review, Practice, Stats are placeholders (navigate to `/` until those pages are built)

### HTTP Client
- **Axios instance**: `client/src/lib/api.ts` — `baseURL: "/api"`, `withCredentials: true`
- Use `api` for all API calls (not raw `fetch`)
- Use **TanStack Query** `useMutation` for writes, `useQuery` for reads
- **Error helper**: `client/src/lib/getApiErrorMessage.ts` — extracts `response.data.message` or returns a fallback string; use this everywhere instead of inline Axios error parsing

### Toasts
- **Sonner** `<Toaster position="bottom-center" />` mounted in `App.tsx`
- Success toasts: `toast.success(msg, { style: { background: "white", color: "#16a34a" }, classNames: { icon: "text-green-600" } })`

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

## Frontend Conventions

### shadcn/ui
- Components live in `client/src/components/ui/`
- Add new components with: `npx shadcn@latest add <name>` (run from `client/`)
- Use `@/` path alias for all imports (e.g. `@/components/ui/button`)
- Theme tokens are CSS variables defined in `client/src/index.css` — always use semantic tokens (`bg-background`, `text-foreground`, `text-destructive`, etc.) rather than hardcoded colors
- Long `className` strings in shadcn wrappers are extracted into named constants at the top of the file
- Custom wrapper components get `.displayName` for React DevTools (skip primitive re-exports where TypeScript disallows it)

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
