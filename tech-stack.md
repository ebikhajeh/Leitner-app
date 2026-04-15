# Tech Stack – Leitner Language Learning App

## Architecture Overview

```
client/   ← React + Vite (SPA)
server/   ← Bun + Express (REST API)
```

Two separate apps in one monorepo. The client talks to the server exclusively via REST API. No shared runtime, no server-side rendering, no hidden abstractions.

---

## Backend — `server/`

### Runtime & Framework
- **Bun** — runtime (replaces Node.js; faster, built-in TS support)
- **Express** — HTTP framework for defining REST routes explicitly

### Database
- **PostgreSQL** hosted on **Supabase** (managed, free tier, inspectable dashboard)
- **Prisma ORM** — type-safe queries, schema-first, auto-generated types

### Authentication
Simple email/password with **database sessions**:
1. Register: hash password with `bcrypt`, store `User` record
2. Login: verify password, generate a random session token, store in `Session` table with `expiresAt`
3. Return token to client via **httpOnly cookie**
4. Protected routes: `authenticate` middleware reads cookie → looks up session in DB → attaches `user` to `req`
5. Logout: delete session from DB

No third-party auth library. Full control.

### AI Integration
- **Anthropic Claude API** (`claude-haiku-4-5`)
- Called from `aiService.ts` — wraps the Anthropic SDK
- Only called from the `/api/practice/evaluate` route
- API key stays server-side only

### Folder Structure

```
server/
  src/
    index.ts              ← Bun entry point, Express app, middleware registration
    routes/
      auth.ts             ← POST /api/auth/register, login, logout; GET /api/auth/me
      cards.ts            ← CRUD /api/cards
      review.ts           ← GET /api/review/due; POST /api/review/:id
      practice.ts         ← POST /api/practice/evaluate
      stats.ts            ← GET /api/stats
      user.ts             ← GET/PUT /api/user/settings
    services/
      authService.ts      ← register, login, logout, getSession
      cardService.ts      ← createCard, getCards, updateCard, deleteCard
      reviewService.ts    ← getDueCards, submitReview, applyLeitnerRules
      aiService.ts        ← evaluateSentence (calls Claude API)
      statsService.ts     ← getStats (totals, retention rate, cards per box)
    middleware/
      authenticate.ts     ← reads session cookie, validates against DB, attaches req.user
      errorHandler.ts     ← central error formatting
    lib/
      db.ts               ← Prisma client singleton
      leitner.ts          ← pure functions: nextBox(), nextReviewDate()
      claude.ts           ← Anthropic SDK wrapper
  prisma/
    schema.prisma
  .env                    ← DATABASE_URL, ANTHROPIC_API_KEY, SESSION_SECRET
```

---

## REST API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, set session cookie |
| POST | `/api/auth/logout` | Yes | Delete session, clear cookie |
| GET | `/api/auth/me` | Yes | Return current user |
| GET | `/api/cards` | Yes | List all user's cards |
| POST | `/api/cards` | Yes | Add new card |
| PUT | `/api/cards/:id` | Yes | Update card |
| DELETE | `/api/cards/:id` | Yes | Delete card |
| GET | `/api/review/due` | Yes | Cards due today (by box schedule) |
| POST | `/api/review/:id` | Yes | Submit difficulty → move card, award XP |
| POST | `/api/practice/evaluate` | Yes | Submit sentence → Claude returns feedback |
| GET | `/api/stats` | Yes | Total words, mastered, retention rate, per-box counts |
| GET | `/api/user/settings` | Yes | Daily new word limit, etc. |
| PUT | `/api/user/settings` | Yes | Update settings |

---

## Data Models (Prisma)

```prisma
model User {
  id             String      @id @default(cuid())
  email          String      @unique
  passwordHash   String
  xp             Int         @default(0)
  level          Int         @default(1)
  streak         Int         @default(0)
  lastReviewedAt DateTime?
  dailyNewLimit  Int         @default(10)
  createdAt      DateTime    @default(now())
  sessions       Session[]
  cards          Flashcard[]
  reviews        ReviewLog[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model Flashcard {
  id              String      @id @default(cuid())
  userId          String
  word            String
  meaning         String
  exampleSentence String
  box             Int         @default(1)
  nextReviewAt    DateTime    @default(now())
  createdAt       DateTime    @default(now())
  user            User        @relation(fields: [userId], references: [id])
  reviews         ReviewLog[]
}

model ReviewLog {
  id          String    @id @default(cuid())
  flashcardId String
  userId      String
  difficulty  String    -- "hard" | "medium" | "easy"
  reviewedAt  DateTime  @default(now())
  card        Flashcard @relation(fields: [flashcardId], references: [id])
  user        User      @relation(fields: [userId], references: [id])
}
```

---

## Leitner Logic (`lib/leitner.ts`)

Pure functions, no side effects — easy to test.

```
Box intervals in days: { 1: 1, 2: 2, 3: 4, 4: 7, 5: 14 }

nextBox(currentBox, difficulty):
  hard   → 1
  medium → max(1, currentBox - 1)
  easy   → min(5, currentBox + 1)

nextReviewDate(box): now + INTERVALS[box] days
```

---

## Frontend — `client/`

### Stack
- **React 19 + TypeScript** — UI
- **Vite** — dev server and bundler
- **React Router v7** — client-side routing
- **TanStack Query** — server state, caching, background refetch
- **Tailwind CSS + shadcn/ui** — styling and components
- **Zustand** — minimal client state (auth session)
- **axios** — HTTP client (with cookie support via `withCredentials`)

### Folder Structure

```
client/
  src/
    pages/
      Login.tsx
      Register.tsx
      Dashboard.tsx       ← progress, due cards count, streak
      Review.tsx          ← active recall flow (word → reveal → hard/medium/easy)
      Practice.tsx        ← sentence input → AI feedback
      Stats.tsx
      Settings.tsx
    components/
      ui/                 ← shadcn components
      Flashcard.tsx
      DifficultyButtons.tsx
      XPBar.tsx
      StreakBadge.tsx
    api/
      client.ts           ← axios instance (baseURL, withCredentials)
      auth.ts
      cards.ts
      review.ts
      practice.ts
      stats.ts
    hooks/
      useAuth.ts
      useDueCards.ts
      useReview.ts
    store/
      authStore.ts        ← Zustand: current user, setUser, clear
  index.html
  vite.config.ts
```

### Data Flow (example: Review session)

```
Review.tsx
  → useDueCards()          calls GET /api/review/due via TanStack Query
  → renders Flashcard      shows word, user clicks "Reveal"
  → shows meaning + example
  → user clicks Hard/Medium/Easy
  → POST /api/review/:id   (difficulty in body)
  → server: reviewService  applyLeitnerRules() → update card box + nextReviewAt
                           award XP → update user.xp, check level/streak
  → response: { card, user }
  → TanStack Query invalidates due cards + stats queries
  → UI updates automatically
```

---

## Deployment

| Layer | Service |
|-------|---------|
| Frontend | Vercel (or Netlify) |
| Backend | Railway or Fly.io (supports Bun natively) |
| Database | Supabase (managed PostgreSQL) |
