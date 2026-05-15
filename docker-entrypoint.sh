#!/bin/bash
set -e

echo "[entrypoint] Waiting for PostgreSQL..."
max_attempts=30
attempt=0
until node -e "require('net').createConnection({host: 'postgres', port: 5432}, () => process.exit(0)).on('error', () => process.exit(1))" || [ $attempt -ge $max_attempts ]; do
  attempt=$((attempt+1))
  echo "PostgreSQL not ready (attempt $attempt/$max_attempts), retrying..."
  sleep 2
done

echo "[entrypoint] PostgreSQL is ready"
echo "[entrypoint] Syncing database schema..."
npx prisma db push --skip-generate || echo "Database already synced (continuing...)"

echo "[entrypoint] Generating Prisma client..."
npx prisma generate

echo "[entrypoint] Seeding database (if needed)..."
npm run db:seed || echo "Admin user already exists"

echo "[entrypoint] Starting application..."
exec npm start
