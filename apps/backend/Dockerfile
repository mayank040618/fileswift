
# Base image with Node.js
FROM node:18-bullseye

# Install system dependencies for file processing
RUN apt-get update && apt-get install -y \
    ghostscript \
    libreoffice \
    tesseract-ocr \
    curl \
    qpdf \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files (monorepo structure awareness)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/web/package.json ./apps/web/
COPY packages/utils/package.json ./packages/utils/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build
RUN pnpm --filter backend build

# Expose port
EXPOSE 8080

# Start
CMD ["pnpm", "--filter", "backend", "run", "start:prod"]
