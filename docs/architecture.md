# Architecture

## Overview
FileSwift uses a monorepo structure managed by pnpm workspaces.

## Services

### Web (Frontend)
Next.js application hosted on Vercel. Handles UI, auth flows (Supabase), and initiates jobs via the Backend API.

### Backend (API)
Fastify server hosted on Render/Railway.
- **REST API**: Handles uploads, job creation, and status polling.
- **Worker**: Processes file conversions and AI tasks.
- **Storage**: Temporary files stored in Cloudflare R2 (1 hour TTL).

### Mobile
Expo/React Native app using the same Backend API.

## Data Flow
1. User uploads file -> Backend (stream to R2) -> API returns Job ID.
2. API pushes job to Queue (BullMQ).
3. Worker picks up job -> Downloads from R2 -> Processes -> Uploads result to R2.
4. Client polls API for status -> Receives Download URL.
