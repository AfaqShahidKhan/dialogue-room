# Dialogue Room v2

A language-exchange platform where users connect to practice languages with real people. Built on a modern monorepo stack with real-time chat and friend discovery.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, TanStack Query 5, Zustand |
| **Backend** | Express 5, TypeScript strict, MongoDB with Mongoose 8, Socket.IO 4 |
| **Shared** | Zod schemas, TypeScript types, constants |
| **Monorepo** | pnpm workspaces, Node 24 |

## Monorepo Structure

```
dialogue-room/
├── packages/shared/          # Zod schemas, types, constants
├── apps/api/                 # Express backend + Socket.IO
│   ├── src/
│   │   ├── server.ts         # Bootstrap
│   │   ├── config/           # env, database
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/
│   │   ├── services/         # Business logic
│   │   ├── models/           # Mongoose schemas
│   │   ├── sockets/          # Socket.IO handlers
│   │   ├── seed/seed.ts      # Demo data (idempotent)
│   │   └── middlewares/
│   └── .env.example
└── apps/web/                 # Next.js 16 frontend
    ├── src/
    │   ├── app/
    │   │   ├── (marketing)/  # Public pages: /, /privacy-policy, /terms, /cookie-policy
    │   │   ├── (auth)/       # Auth pages
    │   │   └── (app)/        # Authenticated app shell
    │   ├── components/
    │   ├── lib/
    │   ├── stores/           # Zustand
    │   └── hooks/
    └── .env.example
```

## Prerequisites

- **Node 24** (managed via `.nvmrc`; use [nvm](https://github.com/nvm-sh/nvm))
- **pnpm** (via corepack: `corepack enable`)
- **MongoDB** running locally (default: `mongodb://localhost:27017/dialogue-room`)

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   # Backend
   cp apps/api/.env.example apps/api/.env
   # Set JWT secrets (min 32 chars each):
   # JWT_ACCESS_SECRET=<random-string>
   # JWT_REFRESH_SECRET=<random-string>

   # Frontend
   cp apps/web/.env.example apps/web/.env.local
   ```

3. **Seed demo data (idempotent):**
   ```bash
   pnpm seed
   ```

4. **Start dev servers:**
   ```bash
   pnpm dev
   ```

   - API: http://localhost:8080
   - Web: http://localhost:3000

5. **Demo logins:**
   ```
   alice@example.com / Password123!
   bob@example.com / Password123!
   ```

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install workspace dependencies |
| `pnpm dev` | Start API + web in dev mode |
| `pnpm build` | Build all workspaces for production |
| `pnpm typecheck` | Type-check without emitting |
| `pnpm seed` | Wipe collections and seed 24 demo users + friendships/conversations |
| `pnpm --filter @dialogue-room/api <cmd>` | Run script in API only |
| `pnpm --filter @dialogue-room/web <cmd>` | Run script in web only |

## Features

- **Auth** — httpOnly cookies (access + refresh tokens), password reset flow
- **Discovery** — Filter users by country, language, age, name search
- **Friendships** — Request → accept/decline, unfriend, pending/accepted states
- **Real-time chat** — 1:1 messaging, typing indicators, read receipts, presence
- **Onboarding** — Collect birthdate and language preferences before app access
- **Light/dark mode** — Theme preference persisted in localStorage

## Key Documents

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Endpoint contracts, data models, validation, Socket.IO events
- **[DESIGN.md](./DESIGN.md)** — Design language, component patterns, screen styles

## MongoDB Collections

- `users` — accounts, profiles, auth
- `friendships` — relationships with status (pending/accepted/declined)
- `conversations` — 1:1 chats with participants + read state
- `messages` — messages with read receipts and cursor pagination

## API Health Check

```bash
curl http://localhost:8080/health
```

## Development Notes

- ESM everywhere (extensionless imports, `moduleResolution: bundler`)
- TypeScript strict mode required
- No hardcoded origins — all come from `.env` files via `NEXT_PUBLIC_*` or `CLIENT_URL`
- Seed script guards against production (exits if `NODE_ENV === "production"`)
- All collections are wiped on each seed run (idempotent)

## Support

For questions or issues, contact support@dialogueroom.com.
