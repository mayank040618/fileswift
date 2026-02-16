# Deployment

## Frontend (Vercel)
1. Import `fileswift` repo.
2. Set Root Directory to `apps/web`.
3. Add Environment Variables from `.env.example`.

## Backend (Render/Railway)
1. Import `fileswift` repo.
2. Set Root Directory to `apps/backend`.
3. Build Command: `pnpm install && pnpm build`.
4. Start Command: `node dist/index.js`.
5. Add Environment Variables (`R2_*`, `REDIS_URL`, etc.).

## Mobile (Expo EAS)
1. `cd apps/mobile`.
2. `eas build --profile production`.
