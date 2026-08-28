# Dialogue Room v2 — Architecture Contract

This document is the **binding contract** for all modules. If code and this document disagree, fix the code (or raise the conflict), don't silently drift.

Dialogue Room is a language-exchange communication platform: users create a profile (country, fluent + learning languages), discover partners with filters, become friends, and chat 1-to-1 in real time.

## Monorepo layout (pnpm workspaces)

```
dialogue-room/
├── packages/shared/     @dialogue-room/shared — Zod schemas, TS types, constants (socket events, limits)
├── apps/api/            @dialogue-room/api — Express 5 + TS + Mongoose 8 + Socket.IO 4
└── apps/web/            @dialogue-room/web — Next.js 15 (App Router) + React 19 + Tailwind 4
```

- Node 24 (`.nvmrc`), TypeScript strict everywhere, ESM in all workspaces (api runs TS directly via tsx, extensionless imports, `moduleResolution: bundler`).
- Both apps import validation schemas + types from `@dialogue-room/shared` (workspace dep). Never redefine a request/response shape locally.
- **No git operations. Never run `git init` or any git command in this repo.**

## Runtime topology

| Service | Port | Env |
|---|---|---|
| API + Socket.IO | 8080 | `apps/api/.env` (`PORT`, `MONGODB_URI`, `JWT_*`, `CLIENT_URL`) |
| Web (Next dev) | 3000 | `apps/web/.env.local` (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`) |
| MongoDB | 27017 | db name `dialogue-room` |

All client-side URLs come from `NEXT_PUBLIC_*` env vars — **never hardcode an origin** in a component.

## Response envelope (REST)

```jsonc
// success
{ "status": "success", "message": "optional", "data": { ... } }
// operational error (AppError) / unexpected
{ "status": "fail" | "error", "message": "..." }
```

Controllers are thin: parse input (already validated by middleware), call service, send envelope. Business logic lives in services. Async controllers wrapped in `asyncHandler`; operational errors thrown as `AppError(message, statusCode)`.

## Auth design (fixes v1's XSS-exposed token)

- **Access token**: JWT (`sub` = userId), 15 min, httpOnly cookie `dr_access`, `SameSite=Lax`, `path=/`.
- **Refresh token**: JWT, 30 days, httpOnly cookie `dr_refresh`, `SameSite=Lax`, `path=/api/v1/auth`.
- `secure: true` cookies when `NODE_ENV=production`. CORS: `origin: CLIENT_URL`, `credentials: true`. Web always fetches with `credentials: "include"`.
- `authenticate` middleware reads **cookie only** (no Authorization header). Attaches `req.user` (full sanitized user doc).
- Passwords: bcryptjs cost 12, min length 8. `updatePassword` **must verify current password**. `resetPassword` logs the user in (sets cookies) on success.
- User payloads returned to clients must pass through one `sanitizeUser()` helper (strips password hash, reset fields, `__v`).
- Socket.IO handshake: same `dr_access` cookie, verified in a socket middleware; socket carries `socket.data.userId`. Reject connection if invalid.

## Mongoose models (`apps/api/src/models`)

**User** — `user.model.ts`
| field | type | notes |
|---|---|---|
| name | string | required, trim, 3–30 |
| email | string | required, unique, lowercase |
| password | string | bcrypt hash, `select: false` |
| role | "user" \| "admin" | default user |
| photo | string | filename, default `default.jpg` |
| bio | string | optional, ≤300 |
| country | string | optional |
| gender | "male" \| "female" \| "nonBinary" \| "other" | optional |
| birthdate | Date | optional at signup, required by onboarding |
| fluentLanguages | string[] | default [] |
| learningLanguages | string[] | default [] |
| onboardingComplete | boolean | default false — set true once birthdate + both language arrays present |
| agreedToTerms | boolean | required true at signup |
| passwordChangedAt / passwordResetToken / passwordResetExpires | | reset flow |
| lastSeenAt | Date | updated on socket disconnect |

Virtual `age` from birthdate. Timestamps on. **No `friends`/`friendRequests` arrays** (v1 dead fields — do not recreate). No `pre("save")` profile-completeness trap — onboarding is explicit via `onboardingComplete`.

**Friendship** — `friendship.model.ts`: `requester` + `recipient` (ObjectId→User), `status: "pending" | "accepted" | "declined"`, timestamps. Canonical sorted `userPair: [ObjectId, ObjectId]` (plain index, query convenience) plus a scalar `pairKey: "smallerId:largerId"` carrying the **unique index** — uniqueness must NOT sit on the array itself (a unique multikey index would allow each user only one friendship in total). Both are set in a `pre("validate")` hook.

**Conversation** — `conversation.model.ts`: `participants: [ObjectId, ObjectId]` (sorted ascending — canonical, plain index), scalar `pairKey: "smallerId:largerId"` carrying the **unique index** (same multikey rationale as Friendship; upsert paths must set `pairKey` explicitly since `findOneAndUpdate` bypasses validate hooks), `lastMessageAt: Date`, `lastMessagePreview: string`, `readState: { [userId]: Date }` (Map of last-read timestamps). Only friends can open a conversation.

**Message** — `message.model.ts`: `conversation` (ObjectId), `sender` (ObjectId), `content` (string, 1–2000, trimmed), `readAt: Date | null`, timestamps. Index `{ conversation: 1, _id: -1 }` for cursor pagination.

**Aggregation rule (v1 leaked password hashes):** any `$lookup` into `users` MUST `$project` to the public field set: `_id name photo country fluentLanguages learningLanguages gender birthdate bio lastSeenAt`.

## REST endpoints (prefix `/api/v1`)

Validation: Joi is out — every body/query is validated with the **Zod schema from `@dialogue-room/shared`** via a `validate(schema, "body" | "query")` middleware (rejects unknown keys with `.strict()` where the schema says so).

### Auth `/auth` (public unless noted)
| Method | Path | Notes |
|---|---|---|
| POST | `/signup` | name, email, password, passwordConfirm, agreedToTerms — sets both cookies |
| POST | `/login` | email, password — sets both cookies |
| POST | `/logout` | clears both cookies (authenticated) |
| POST | `/refresh` | rotates access cookie from refresh cookie |
| POST | `/forgot-password` | always responds 200 "if that email exists…" (no user enumeration); emails `${CLIENT_URL}/reset-password/${token}` |
| PATCH | `/reset-password/:token` | password + passwordConfirm; logs in on success |
| PATCH | `/update-password` | authenticated; currentPassword + password + passwordConfirm; **verifies currentPassword** |

### Users `/users` (all authenticated)
| Method | Path | Notes |
|---|---|---|
| GET | `/me` | current sanitized user |
| PATCH | `/me` | profile fields (name, bio, country, gender, birthdate, languages) — multipart with optional `photo` (multer, 2 MB, jpeg/png/webp, resized/renamed `user-<id>-<ts>.<ext>`); recomputes `onboardingComplete`; **never** accepts email/password/role here |
| GET | `/` | discovery: query filters `country`, `gender`, `maxAge`, `learningLanguage`, `fluentLanguage`, `q` (name search), `page`, `limit` (default 20, max 50). Excludes self. Returns `{ users, total, page, pages }`. Each result includes `friendshipStatus: "none" | "pendingOutgoing" | "pendingIncoming" | "friends"` |
| GET | `/:id` | public profile of one user (sanitized public fields + friendshipStatus) |

### Friendships `/friendships` (all authenticated)
| Method | Path | Notes |
|---|---|---|
| POST | `/` | `{ recipientId }` — create pending; 409 if any friendship exists either direction; emits socket `friendRequest:new` to recipient |
| PATCH | `/:id/accept` | recipient only; emits `friendRequest:accepted` to requester |
| PATCH | `/:id/decline` | **recipient only** (v1 bug fixed — separate from cancel) |
| DELETE | `/:id` | cancel: requester only, while pending |
| DELETE | `/with/:userId` | unfriend: either side, when accepted |
| GET | `/friends` | accepted friends (public fields, + presence handled client-side) |
| GET | `/requests/incoming` | pending where I'm recipient (populated requester) |
| GET | `/requests/outgoing` | pending where I'm requester (populated recipient) |

### Conversations `/conversations` (all authenticated, friends-only)
| Method | Path | Notes |
|---|---|---|
| POST | `/` | `{ userId }` — get-or-create conversation with a friend (403 if not friends) |
| GET | `/` | my conversations, sorted by `lastMessageAt` desc, each with other-participant public fields + `unreadCount` |
| GET | `/:id/messages` | cursor pagination: `?before=<messageId>&limit=30` (default 30, max 50), newest-first from cursor; response `{ messages, nextCursor }` |
| POST | `/:id/messages` | REST fallback for sending (same service as socket path) |
| PATCH | `/:id/read` | mark conversation read up to now; updates `readState`, emits `message:read` |

Static uploads: `GET /uploads/users/<file>` served by the API with sensible cache headers.

## Socket.IO contract (event names are constants in `@dialogue-room/shared` — import, never inline strings)

Rooms: every authenticated socket joins `user:<userId>`. Conversation rooms `conversation:<id>` joined/left explicitly (server verifies membership before joining).

| Constant | Event | Direction | Payload |
|---|---|---|---|
| `SOCKET_EVENTS.CONVERSATION_JOIN` | `conversation:join` | client→server | `conversationId` |
| `SOCKET_EVENTS.CONVERSATION_LEAVE` | `conversation:leave` | client→server | `conversationId` |
| `SOCKET_EVENTS.MESSAGE_SEND` | `message:send` | client→server | `{ conversationId, content, tempId }` → ack `{ status, message? }`; persists via the same service as REST |
| `SOCKET_EVENTS.MESSAGE_NEW` | `message:new` | server→client | `{ message, tempId? }` to `conversation:<id>` **and** `user:<otherId>` (for list/unread updates) |
| `SOCKET_EVENTS.MESSAGE_READ` | `message:read` | server→client | `{ conversationId, userId, readAt }` |
| `SOCKET_EVENTS.TYPING_START` / `TYPING_STOP` | `typing:start` / `typing:stop` | client→server, relayed server→room | `{ conversationId }` relayed as `{ conversationId, userId }` (not persisted) |
| `SOCKET_EVENTS.PRESENCE_UPDATE` | `presence:update` | server→client | `{ userId, online, lastSeenAt? }` broadcast to that user's friends' `user:` rooms |
| `SOCKET_EVENTS.PRESENCE_SNAPSHOT` | `presence:snapshot` | server→client on connect | `{ onlineUserIds: string[] }` (friends only) |
| `SOCKET_EVENTS.FRIEND_REQUEST_NEW` | `friendRequest:new` | server→client | `{ friendship }` (populated requester public fields) |
| `SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED` | `friendRequest:accepted` | server→client | `{ friendship }` |

Presence registry: in-memory `Map<userId, Set<socketId>>` in `apps/api/src/sockets/presence.ts`. Online = set non-empty. On last disconnect: persist `lastSeenAt`, broadcast offline.

REST controllers/services that need to emit import a typed `emitToUser(userId, event, payload)` / `emitToConversation(...)` helper from `apps/api/src/sockets/emitter.ts` (backed by the `io` instance set in `server.ts`) — no `req.app.get("io")` scattering.

## API app internals

```
apps/api/src/
├── server.ts            # bootstrap: env, db, http, socket.io, graceful shutdown
├── app.ts               # express app factory (no listen) — testable
├── config/env.ts        # zod-validated process.env — fail fast on boot
├── config/db.ts
├── routes/index.ts      # apiRouter mounting auth/users/friendships/conversations
├── routes/*.routes.ts
├── controllers/*.controller.ts
├── services/*.service.ts
├── models/*.model.ts + models/index.ts
├── middlewares/         # authenticate, validate, errorHandler, asyncHandler, upload, rateLimiter
├── sockets/             # index.ts (registration), auth.ts, presence.ts, emitter.ts, chat.handlers.ts
├── utils/               # AppError, sanitizeUser, email (nodemailer), tokens
└── seed/seed.ts         # faker demo data (idempotent: wipes + recreates, guarded to NODE_ENV !== "production")
```

Middleware order in `app.ts`: cors(CLIENT_URL, credentials) → helmet → cookie-parser → express.json({limit:"1mb"}) → static `/uploads` → rate limit `/api` (300/15min; 10/15min on `/api/v1/auth/login|signup|forgot-password`) → routes → 404 → errorHandler. Error handler hides stack unless `NODE_ENV=development`.

## Web app

```
apps/web/src/
├── app/                    # App Router
│   ├── (marketing)/        # /, /privacy-policy, /terms, /cookie-policy  (public)
│   ├── (auth)/             # /login, /register, /forgot-password, /reset-password/[token]
│   └── (app)/              # authenticated shell with sidebar: /home, /search, /friends, /chat, /chat/[conversationId], /profile, /onboarding
├── components/             # ui primitives + feature components
├── lib/api.ts              # fetch wrapper: credentials include, envelope unwrap, 401 → one refresh retry → redirect /login
├── lib/socket.ts           # singleton socket.io-client (autoConnect false; connect after auth)
├── providers/              # QueryProvider (TanStack), SocketProvider, ThemeProvider
├── stores/                 # zustand: auth store (user), presence store (online ids)
└── hooks/                  # useConversations, useMessages (infinite query), useFriends, useTyping, ...
```

- TanStack Query 5 for all server state (query keys: `["me"]`, `["users", filters]`, `["friends"]`, `["requests", dir]`, `["conversations"]`, `["messages", conversationId]` infinite). Socket events invalidate/update caches — messages are **appended into the query cache**, not refetched.
- Zustand only for: current user snapshot, socket connection state, online-presence set.
- Auth gating: `(app)` layout fetches `/users/me`; on 401 redirect to `/login`. Middleware-free (cookies are httpOnly; the API is the source of truth). If `onboardingComplete` is false, `(app)` routes redirect to `/onboarding`.
- Optimistic send: message appears instantly with `tempId`, reconciled on `message:new` ack.
- Theme: light/dark via `class` on `<html>`, persisted in localStorage, Tailwind 4 `dark:` variants.
- Toasts: `sonner`. Forms: react-hook-form + `@hookform/resolvers/zod` with the **shared** schemas.

## Shared package (`packages/shared`)

- `src/constants.ts`: `SOCKET_EVENTS`, `LIMITS` (message length, page sizes), `LANGUAGES` + `COUNTRIES` curated lists (trimmed from v1's 189-country mock — names only).
- `src/schemas/*.ts`: zod schemas — `signupSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, `updatePasswordSchema`, `updateProfileSchema`, `userDiscoveryQuerySchema`, `sendFriendRequestSchema`, `createConversationSchema`, `sendMessageSchema`, `messagesQuerySchema`.
- `src/types.ts`: `PublicUser`, `Me`, `Friendship`, `ConversationListItem`, `ChatMessage`, `ApiEnvelope<T>`, socket payload types.

## Verification gates (every module must pass before it's "done")

1. `pnpm typecheck` clean in the touched workspace.
2. API: `pnpm --filter @dialogue-room/api test` green (Vitest + Supertest + mongodb-memory-server).
3. Web: `pnpm --filter @dialogue-room/web build` succeeds.
4. No hardcoded origins/ports outside env files; no `any` unless annotated with a reason.
