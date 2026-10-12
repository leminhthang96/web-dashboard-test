Each directory under `src/app/api/` is a Next.js Route Handler using file-system routing, exporting HTTP-method functions (`GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`). Four independent route groups exist:
- `auth/[...nextauth]/route.ts` — re-exports the shared `@/auth` handlers for NextAuth session endpoints.
- `customers/route.ts` — unauthenticated POST persisted via `@/lib/firebase/client` (`addDoc`) and fires an outbound Telegram notification using `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` env vars.
- `tasks/route.ts` — stateless mock GET returning seeded pseudo-random task data (no DB/auth).
- `telegram/route.ts` — minimal placeholder webhook stub.
Dependency direction is one-way: routes depend only on shared libraries and feature types; nothing inside this scope imports sibling route files. All responses are shaped as `{ success, message?, data?, errors? }` JSON via `NextResponse.json`.
