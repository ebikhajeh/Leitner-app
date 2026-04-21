---
name: E2E Infrastructure
description: Ports, Playwright config, global setup/teardown pipeline, test credentials, and run scripts
type: project
---

## Ports
- Frontend (test): http://localhost:5174 (Vite `--mode test --port 5174`)
- Backend (test): http://localhost:3001 (Express; reads `server/.env.test`)
- Frontend (dev): http://localhost:5173
- Backend (dev): http://localhost:3000

## Playwright Config
- File: `playwright.config.ts` at project root
- `testDir`: `./e2e`
- `globalSetup`: `./e2e/global-setup.ts`
- `globalTeardown`: `./e2e/global-teardown.ts`
- `fullyParallel: false`, `workers: 1` (tests run serially)
- `baseURL`: `http://localhost:5174`
- Single project: chromium Desktop Chrome

## Global Setup / Teardown
- `global-setup.ts`: runs `bun src/db-ensure.ts`, `bun prisma migrate deploy`, `bun src/seed.ts` in `server/` with test env
- `global-teardown.ts`: runs `bun src/db-teardown.ts` in `server/`
- Test env vars loaded from `server/.env.test` via dotenv in setup/teardown scripts AND spread into webServer env in playwright.config.ts

## Test Credentials (seeded user)
- Email: `test@leitner.local`
- Password: `TestPassword123!`

## Run Scripts
```bash
bun run test:e2e        # headless
bun run test:e2e:ui     # UI mode
```

## Test File Location
All spec files live in `e2e/` at project root. Naming: `<feature>.spec.ts`.
