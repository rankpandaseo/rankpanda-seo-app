#!/bin/bash
set -e

echo "[entrypoint] Waiting for PostgreSQL..."
until pg_isready -h postgres -U rankpanda; do
  echo "PostgreSQL not ready, retrying..."
  sleep 2
done

echo "[entrypoint] PostgreSQL is ready"
echo "[entrypoint] Running database migrations..."
npx prisma migrate deploy || echo "Migrations already applied or failed (continuing...)"

echo "[entrypoint] Generating Prisma client..."
npx prisma generate

echo "[entrypoint] Seeding database (if needed)..."
npm run db:seed || echo "Admin user already exists"

echo "[entrypoint] Starting application..."
exec npm start
