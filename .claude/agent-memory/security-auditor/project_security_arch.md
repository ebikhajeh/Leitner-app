---
name: Leitner App — Security Architecture
description: Key security-relevant configuration locations, patterns, and decisions across the full stack
type: project
---

## Auth Configuration
- Better Auth config: `server/src/lib/auth.ts` — uses prismaAdapter, emailAndPassword enabled, trustedOrigins from CLIENT_URL env var
- `BETTER_AUTH_SECRET` is set in `server/.env` (not tracked by git — confirmed)
- No explicit cookie configuration (httpOnly, Secure, SameSite) in auth.ts — relies on Better Auth defaults
- `requireAuth` middleware: `server/src/middleware/requireAuth.ts` — calls `auth.api.getSession()`, sets `res.locals.user` and `res.locals.session`

## CORS Configuration
- `server/src/index.ts` line 10: `cors({ origin: process.env.CLIENT_URL, credentials: true })` — correctly restricted to CLIENT_URL

## Routes
- `/api/health` — unauthenticated, public (intentional)
- `/api/me` — protected with requireAuth (correct)
- `/api/auth/{*any}` — Better Auth handler (registered before express.json() — correct)
- No application-specific routes beyond health and me exist yet (early-stage app)

## Known Issues Found (initial audit 2026-04-16)
1. CRITICAL: `server/.env` contains real credentials (DB password, BETTER_AUTH_SECRET) — `.env.example` has weak placeholder credentials (TEST_USER_PASSWORD="password123")
2. HIGH: `/api/me` returns full session object including session token — over-exposure
3. HIGH: No `BETTER_AUTH_SECRET` validation at startup — auth.ts does not check for it
4. HIGH: No rate limiting on auth endpoints or any routes
5. HIGH: No express.json() body size limit set
6. MEDIUM: `res.locals` type augmentation makes user/session non-optional — could mask null checks
7. MEDIUM: Seed script commits weak credentials to example config
8. LOW: No `BETTER_AUTH_URL` validation at startup
9. LOW: Client .env only has VITE_API_URL (correct — no secrets leaked to frontend)

## Data Flow
- User input flows: LoginPage form -> Zod validation -> Better Auth signIn.email -> httpOnly cookie set by server
- Session data flows: requireAuth -> res.locals.user/session -> route handler -> JSON response
- No AI integration, no flashcard routes implemented yet (stub app)

## No Raw SQL
- No `$queryRaw` / `$executeRaw` usage in application code (only in generated Prisma internals)
- All DB access goes through Prisma ORM

## Frontend Security
- No dangerouslySetInnerHTML usage
- No localStorage/sessionStorage usage for auth data
- ProtectedRoute in App.tsx does client-side redirect — correct, but backend auth is the real guard
- `VITE_API_URL` only points to localhost:3000 — no internal infrastructure exposure
