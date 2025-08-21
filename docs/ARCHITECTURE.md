## Architecture

- Frontend: Next.js App Router, Tailwind. Client calls only internal API routes.
- Backend: Next.js route handlers under `app/api/*`. No Donut API key exposed.
- DB: Prisma with SQLite (dev) or Postgres (prod). Models: `AuctionSnapshot`, `FlipRecipe`, `FlipRecipeAlias`, `FlipOpportunity`.
- Jobs: Manual `POST /api/jobs/refresh` triggers fetch + compute. Can be scheduled via external cron.
- External API: Thin client in `lib/donutApi.ts` with retry, 429 backoff, timeout, in-memory cache (~90s), and mock mode using fixtures.
- Flip computation: `lib/computeFlips.ts` pulls auctions, persists snapshots, computes opportunities, stores results.

Data flow:
Client → `/api/flips` (read opportunities)
Client → `/api/jobs/refresh` (compute)
Server → Donut API (`/auctions`) only from server-side code.

Security: API key is read only on server. Build/dev scripts enforce presence unless `MOCK_MODE=true`.

