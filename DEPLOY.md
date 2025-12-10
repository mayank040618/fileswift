# FileSwift Deployment Guide

## 1. Backend (Docker-based PaaS)
Apps like **Railway**, **Render**, or **Fly.io** are recommended because the backend requires specific system binaries (`ghostscript`, `qpdf`) which are included in our Dockerfile.

### 1a. Deployment Configuration
*   **Repo Root**: Deploy from the monorepo root.
*   **Docker Context**: Root (`.`).
*   **Dockerfile Path**: `apps/backend/Dockerfile`.
*   **Build Command**: (Docker handles this automatically).
*   **Start Command**: `pnpm --filter backend start`.
*   **Port**: `8080`.

### 1b. Service Dependencies
You also need a **Redis** instance.
*   **Railway**: Add a Redis service and link it.
*   **Render**: Create a Redis instance.
*   **Environment Var**: `REDIS_URL=redis://...`

### 1c. Environment Variables (Required in Production)
Set these in your cloud dashboard:

```env
NODE_ENV=production
PORT=8080
REDIS_URL=redis://your-redis-host:6379

# Storage (Switching from Local to S3/R2)
STORAGE_PROVIDER=r2  # or 's3'
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=fileswift-prod
# If using AWS S3:
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_REGION=us-east-1
# AWS_BUCKET_NAME=...
```

### 1d. Health Checks (Vital)
Configure your platform's health check to ensure tools are ready:
*   **Path**: `/api/health/gs`
*   **Success Code**: `200`
*   **Expected Response**: `{"status":"ok", "ghostscript":"...", "qpdf":"...", "sips":"..."}`

---

## 2. Frontend (Vercel)
Deploy the Next.js app (`apps/web`) to Vercel/Netlify.

1.  **Framework Preset**: Next.js
2.  **Root Directory**: `apps/web`
3.  **Build Command**: `cd ../.. && pnpm build` (Ensure access to monorepo shared packages)
4.  **Install Command**: `cd ../.. && pnpm install`

### Environment Variables
```env
# Point to your deployed Backend URL
NEXT_PUBLIC_API_URL=https://fileswift-backend.railway.app 
```

---

## 3. Verification
After deployment, verify the system tools:

1.  **Check Tools**: Visit `https://your-backend.com/api/health/gs`
2.  **Run Smoke Test**:
    You can run the smoke test script locally against the remote URL:
    ```bash
    NEXT_PUBLIC_API_URL=https://your-backend.com node scripts/smoke-check-pdf-compress.js
    ```
