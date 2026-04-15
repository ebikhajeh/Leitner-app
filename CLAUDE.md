# Leitner App — Claude Code Project Config

## Stack
- **Runtime**: Bun
- **Backend**: Express 5 + TypeScript (`server/`)
- **Frontend**: React 19 + Vite + TypeScript (`client/`)
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Auth**: Custom session-based (httpOnly cookie)
- **AI**: Anthropic Claude API (server-side only)

## Project Structure
```
server/   ← Bun + Express REST API (port 3000)
client/   ← React + Vite SPA (port 5173, proxies /api to server)
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
| Prisma | resolve via `mcp__context7__resolve-library-id` |
| TanStack Query | resolve via `mcp__context7__resolve-library-id` |

## Dev Commands
```bash
bun run dev:server   # start Express (server/)
bun run dev:client   # start Vite (client/)
```
