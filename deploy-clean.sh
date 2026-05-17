#!/bin/bash
set -e

echo "[DEPLOY] Starting clean rebuild and deployment..."

# 1. Pull latest code
echo "[DEPLOY] Pulling latest code from GitHub..."
git pull origin main

# 2. Stop and remove containers + volumes
echo "[DEPLOY] Stopping containers and removing volumes..."
docker compose down -v

# 3. Remove node_modules to force fresh install
echo "[DEPLOY] Removing node_modules cache..."
rm -rf node_modules package-lock.json

# 4. Build with --no-cache to force complete rebuild
echo "[DEPLOY] Building Docker image (clean, no cache)..."
docker compose build --no-cache app

# 5. Start containers
echo "[DEPLOY] Starting containers..."
docker compose up -d

# 6. Wait for app to be ready
echo "[DEPLOY] Waiting for app to be ready..."
sleep 5

# 7. Verify health endpoint
echo "[DEPLOY] Verifying health endpoint..."
MAX_RETRIES=30
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
  if curl -s https://app.rankpanda.cloud/api/health | grep -q "ok"; then
    echo "[DEPLOY] ✅ Health endpoint responding!"
    break
  fi
  echo "[DEPLOY] Waiting... ($((RETRY+1))/$MAX_RETRIES)"
  sleep 1
  ((RETRY++))
done

if [ $RETRY -eq $MAX_RETRIES ]; then
  echo "[DEPLOY] ❌ Health endpoint not responding after 30s"
  docker compose logs app --tail=50
  exit 1
fi

# 8. Test signup endpoint
echo "[DEPLOY] Testing signup endpoint..."
TEST_EMAIL="test-$(date +%s)@rankpanda.pt"
TEST_PASSWORD="TestPass123!"

SIGNUP_RESPONSE=$(curl -s -X POST https://app.rankpanda.cloud/auth/signup \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$TEST_EMAIL&password=$TEST_PASSWORD&confirmPassword=$TEST_PASSWORD" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "[DEPLOY] ✅ Signup endpoint working (200 OK)"
else
  echo "[DEPLOY] ❌ Signup endpoint returned HTTP $HTTP_CODE"
  echo "[DEPLOY] Response:"
  echo "$SIGNUP_RESPONSE"
  exit 1
fi

echo "[DEPLOY] ✅ DEPLOYMENT SUCCESSFUL"
echo "[DEPLOY] All systems operational"
