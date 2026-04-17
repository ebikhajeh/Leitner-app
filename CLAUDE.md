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
server/   ← Bun + Express REST API (port 3000)
client/   ← React + Vite SPA (port 5173, proxies /api to server)
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

## E2E Testing

Playwright is configured at the repo root (`playwright.config.ts`). Tests go in `e2e/`.

### Test environment
- Test Express server runs on port **3001**; test Vite client on port **5174**
- Dedicated test database: `leitner_test` (never the dev database)
- Config: `server/.env.test` — overrides `DATABASE_URL` and `PORT`
- `NODE_ENV=test` causes Bun to load `.env.test` automatically with higher priority than `.env`
- Client proxy target is overridden via `client/.env.test` (`API_TARGET=http://localhost:3001`)

### Global setup (`e2e/global-setup.ts`) — runs before any test
1. `server/src/db-ensure.ts` — creates `leitner_test` if it doesn't exist
2. `bun prisma migrate deploy` — applies pending migrations to the test DB
3. `bun src/seed.ts` — creates the test user (idempotent)

### Global teardown (`e2e/global-teardown.ts`) — runs after all tests
Runs `server/src/db-teardown.ts` — truncates all tables with `CASCADE`, leaving the schema intact.

### Test credentials
- Email: `test@leitner.local` (`TEST_USER_EMAIL` in `server/.env.test`)
- Password: `TestPassword123!` (`TEST_USER_PASSWORD` in `server/.env.test`)

### One-time prerequisite
If `db-ensure.ts` cannot create the database due to permissions, run manually:
```bash
psql -U postgres -c 'CREATE DATABASE "leitner_test"'
```

## Security

### Patterns in place — do not revert
- **`/api/me`** returns only `{ user: { id, name, email, image } }` — the session object (which contains the raw token) is intentionally excluded
- **Startup validation** — `server/src/lib/auth.ts` throws if `CLIENT_URL`, `DB_PROVIDER`, or `BETTER_AUTH_SECRET` are missing
- **Rate limiting** — `express-rate-limit` on `/api/auth` in production only (20 req / 15 min); registered before the Better Auth handler in `server/src/index.ts`

## Frontend Conventions

### shadcn/ui
- Components live in `client/src/components/ui/`
- Add new components with: `npx shadcn@latest add <name>` (run from `client/`)
- Use `@/` path alias for all imports (e.g. `@/components/ui/button`)
- Theme tokens are CSS variables defined in `client/src/index.css` — always use semantic tokens (`bg-background`, `text-foreground`, `text-destructive`, etc.) rather than hardcoded colors

### Forms
- Use **React Hook Form** + **Zod** for all forms
- Wire shadcn `Input` and `Label` with RHF `register()` and `htmlFor`/`id` pairing
- Show field errors with `<p className="text-destructive text-xs">` below the input
- Show server errors with `<p className="text-destructive text-sm">` above the submit button
