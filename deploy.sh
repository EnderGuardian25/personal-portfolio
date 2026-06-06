#!/bin/bash
set -e  # exit immediately if any command fails

echo "→ Pulling latest code..."
git pull origin main

echo "→ Installing dependencies..."
npm install --legacy-peer-deps

echo "→ Building..."
npm run build

echo "→ Restarting app with PM2..."
# Start fresh if not already running, otherwise reload gracefully
pm2 describe portfolio > /dev/null 2>&1 && pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js

echo "→ Saving PM2 process list..."
pm2 save

echo "✓ Deploy complete. Site is live."
