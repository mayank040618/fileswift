# FileSwift

FileSwift is an AI-powered file utility hub providing PDF compression, conversion, image upscaling, and more.

## Architecture

Specific implementation details are in `/docs` and respective packages.

- **Frontend**: Next.js 14 (apps/web)
- **Backend**: Node.js + Fastify (apps/backend)
- **Mobile**: React Native + Expo (apps/mobile)
- **Shared**: @fileswift/ui, @fileswift/utils

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development mode:
   ```bash
   pnpm dev
   ```

## Deployment

- **Web**: Vercel
- **Backend**: Render/Railway

## System Requirements

You can check tool status at `/api/health/gs`.
