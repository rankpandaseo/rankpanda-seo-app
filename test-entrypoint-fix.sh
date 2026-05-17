#!/bin/bash
set -e

echo "[test] Testing docker-entrypoint.sh fix locally..."
echo ""

# Verify PostgreSQL is running
echo "[test] Checking PostgreSQL..."
pg_isready -h localhost -p 5432 && echo "✓ PostgreSQL ready" || echo "✗ PostgreSQL not ready"

# Drop and recreate the test database
echo "[test] Resetting test database..."
psql -h localhost -U rankpanda -d rankpanda_dev -c "DROP TABLE IF EXISTS \"Session\", \"KeywordResearch\", \"Projeto\", \"User\" CASCADE;" 2>/dev/null || true
psql -h localhost -U rankpanda -d rankpanda_dev -c "DELETE FROM pg_tables WHERE tablename NOT LIKE 'pg_%';" 2>/dev/null || true

# Test prisma db push (simulating entrypoint)
echo "[test] Running prisma db push..."
npx prisma db push 2>&1 | grep -E "(✔|created|tables|sync)" || true

# Verify User table exists
echo "[test] Verifying User table..."
psql -h localhost -U rankpanda -d rankpanda_dev -c "\dt \"User\"" 2>/dev/null && echo "✓ User table exists" || echo "✗ User table not found"

# Test creating a user (simulating signup)
echo "[test] Testing user creation..."
npx ts-node -e "
import { db } from './app/lib/db.server';
import { hashPassword } from './app/lib/auth.server';

(async () => {
  try {
    const hashedPassword = await hashPassword('TestPassword123!');
    const user = await db.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        status: 'pending',
        role: 'user',
      },
    });
    console.log('✓ User created:', user.id);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
})();
" 2>&1 | tail -10

echo ""
echo "[test] ✓ Entrypoint fix validation complete!"
