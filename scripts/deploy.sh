#!/bin/bash
set -e

echo "RankPanda SEO App — Deploy to VPS"
echo "=================================="

# Configuration
VPS_IP="76.13.58.79"
VPS_USER="root"
APP_DIR="/opt/rankpanda-app"
DOMAIN="app.rankpanda.cloud"

if [ -z "$1" ]; then
  echo "Usage: ./scripts/deploy.sh <env>"
  echo "  env: staging or production"
  exit 1
fi

ENV=$1

echo "Target: $ENV ($VPS_IP)"
echo ""

# 1. Sync code to VPS
echo "1. Syncing code to VPS..."
ssh "$VPS_USER@$VPS_IP" "mkdir -p $APP_DIR" 2>/dev/null || true
rsync -avz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.env* \
  --exclude=.git \
  . "$VPS_USER@$VPS_IP:$APP_DIR/"

# 2. Build and start containers
echo ""
echo "2. Building and starting containers..."
ssh "$VPS_USER@$VPS_IP" "cd $APP_DIR && docker-compose -f docker-compose.prod.yml build"
ssh "$VPS_USER@$VPS_IP" "cd $APP_DIR && docker-compose -f docker-compose.prod.yml down" 2>/dev/null || true
ssh "$VPS_USER@$VPS_IP" "cd $APP_DIR && docker-compose -f docker-compose.prod.yml up -d"

# 3. Run migrations
echo ""
echo "3. Running Prisma migrations..."
ssh "$VPS_USER@$VPS_IP" "cd $APP_DIR && docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy"

# 4. Verify health
echo ""
echo "4. Verifying health..."
sleep 5
HEALTH=$(curl -s "https://$DOMAIN/api/health" 2>/dev/null || echo "")
if [[ $HEALTH == *"ok"* ]]; then
  echo "✓ App is healthy"
else
  echo "! Warning: Could not verify health via HTTPS"
  curl -s "http://localhost:3000/api/health" || true
fi

echo ""
echo "Deploy complete!"
echo "App URL: https://$DOMAIN"
