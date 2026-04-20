# Leitner App — Claude Code Project Config

## Stack
- **Runtime**: Bun
- **Backend**: Express 5 + TypeScript (`server/`)
- **Frontend**: React 19 + Vite + TypeScript (`client/`)
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Auth**: Better Auth (session-based, httpOnly cookie)
- **UI**: shadcn/ui (style: `base-nova`, neutral base color, CSS variables, Tailwind v4)
- **AI**: Anthropic Claude API (server-side only)

## Project Structure
```
server/   ← Bun + Express REST API (port 3000 dev, 3001 test)
client/   ← React + Vite SPA (port 5173 dev / 5174 test, proxies /api to server)
e2e/      ← Playwright E2E tests and global setup/teardown
```

Each app has its own `node_modules` — they are not a Bun workspace.

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

To add a new resource, create `server/src/routes/<resource>.ts`, export a Router, and mount it with `app.use("/api/<resource>", router)` in `index.ts`.

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

### Toasts
- **Sonner** `<Toaster position="bottom-center" />` mounted in `App.tsx`
- Success toasts: `toast.success(msg, { style: { background: "white", color: "#16a34a" }, classNames: { icon: "text-green-600" } })`

## Frontend Conventions

### shadcn/ui
- Components live in `client/src/components/ui/`
- Add new components with: `npx shadcn@latest add <name>` (run from `client/`)
- Use `@/` path alias for all imports (e.g. `@/components/ui/button`)
- Theme tokens are CSS variables defined in `client/src/index.css` — always use semantic tokens (`bg-background`, `text-foreground`, `text-destructive`, etc.) rather than hardcoded colors

### Layout
- Content pages use `px-5 pt-6 pb-28 max-w-lg mx-auto` — `pb-28` clears the fixed bottom nav
- Cards: `bg-card rounded-2xl border border-border p-5`
- Form labels: raw `<label>` with `text-xs font-semibold text-muted-foreground uppercase tracking-wider`
- Form inputs: raw `<input>` / `<textarea>` with `inputClass` (see `AddWordPage.tsx` for the pattern)

### Forms
- Use **React Hook Form** + **Zod** for all forms
- Show field errors with `<p className="text-destructive text-xs">` below the input
- Show server errors with `<p className="text-destructive text-sm">` above the submit button
- Wrap mutations in `useMutation` — use `isPending` from the mutation (not RHF's `isSubmitting`) for loading state
