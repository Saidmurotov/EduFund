# EduFund AI Deployment

## Frontend

Deploy the Vite app as a static SPA. For Vercel, keep `vercel.json` as-is and set:

```text
VITE_API_BASE_URL=https://YOUR_BACKEND_URL/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

## Backend

Deploy `server/` as a long-running Node service, for example Cloud Run, Render, Railway, Fly.io, or a VPS.

Required backend env:

```text
PORT=3001
CORS_ORIGIN=https://YOUR_FRONTEND_DOMAIN
GOOGLE_API_KEY=...
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
JOB_SECRET=replace_with_long_random_secret
NOTIFICATION_TIMEZONE=Asia/Tashkent
ENABLE_EMBEDDED_CRON=false
MAX_QUERY_CANDIDATES=500
MAX_ADMIN_STATS_SCAN=5000
MAX_NOTIFICATION_USERS_SCAN=5000
```

Use `server/Dockerfile` for container deploys.

## Firestore Indexes And Existing Data

Deploy rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Backfill normalized grant query fields for existing grant documents:

```bash
npm --prefix server run backfill:grant-indexes
```

New grants created through the API or seed script include these fields automatically.

## Scheduled Notifications

Prefer an external scheduler in production so multiple backend instances do not run the same cron job.

Call this endpoint once per day:

```bash
curl -X POST https://YOUR_BACKEND_URL/api/jobs/notifications/daily \
  -H "x-job-secret: $JOB_SECRET"
```

Only set `ENABLE_EMBEDDED_CRON=true` for a single-instance deployment.

## Smoke Checks

After deploy:

```bash
curl https://YOUR_BACKEND_URL/api/health
npm --prefix server test
npm --prefix server audit --omit=dev
npm --prefix server run smoke:firebase
npm run build
```
