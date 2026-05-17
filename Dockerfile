# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and Prisma schema
COPY . .

# Build Remix app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built Remix app from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Generate Prisma Client for production
RUN npx prisma generate

# Create entrypoint script using sh (Alpine compatible)
RUN sh -c 'cat > /app/docker-entrypoint.sh' << 'EOF'
#!/bin/sh
set -e

echo "[entrypoint] Waiting for PostgreSQL..."
max_attempts=30
attempt=0
until node -e 'require("net").createConnection({host: "postgres", port: 5432}, () => process.exit(0)).on("error", () => process.exit(1))' || [ $attempt -ge $max_attempts ]; do
  attempt=$((attempt+1))
  echo "PostgreSQL not ready (attempt $attempt/$max_attempts), retrying..."
  sleep 2
done

echo "[entrypoint] PostgreSQL is ready"
echo "[entrypoint] Syncing database schema..."
npx prisma db push || echo "Database already synced (continuing...)"

echo "[entrypoint] Seeding database (if needed)..."
npm run db:seed || echo "Admin user already exists"

echo "[entrypoint] Starting application..."
exec npm start
EOF
RUN chmod +x /app/docker-entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
EXPOSE 3000

CMD ["/bin/sh", "/app/docker-entrypoint.sh"]
