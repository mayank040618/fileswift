#!/bin/bash

# Ensure we are in the script's directory's parent (backend root)
cd "$(dirname "$0")/.."

echo "🚀 Starting FileSwift Backend Locally..."

# Check Redis
if ! pgrep redis-server > /dev/null; then
    echo "📦 Starting Redis..."
    brew services start redis
fi

# Build
echo "🔨 Building Backend..."
export PATH=$PATH:$(npm bin)
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Build Failed!"
    exit 1
fi

# Cleanup Port 8080
echo "🧹 Cleaning up port 8080..."
lsof -ti:8080 | xargs kill -9 2>/dev/null

# Start
echo "✅ Build Success. Starting Server on port 8080..."
echo "👉 In another terminal, try this tunnel: ssh -R 80:localhost:8080 nokey@localhost.run"

export REDIS_URL="redis://localhost:6379"
export STORAGE_PROVIDER="local"
export PORT=8080
export USE_MOCK_QUEUE="false"

node dist/index.js
