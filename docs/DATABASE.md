# Database Schema & Management

## Overview

**Database:** PostgreSQL 16  
**ORM:** Prisma  
**Location:** `prisma/schema.prisma`

## Schema

### User Model

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String     // bcryptjs hashed
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  keywords  Keyword[]
  sessions  Session[]
}
```

**Indexes:**
- `email` (unique) — fast login queries

**Constraints:**
- `email` is required and unique per application

---

### Keyword Model

```prisma
model Keyword {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  keyword    String
  searchVolume Int?
  intent     String?  // "informational", "commercial", "transactional"
  status     String?  // "active", "archived"
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])  // Fast user lookups
  @@unique([userId, keyword])  // Prevent duplicate keywords per user
}
```

**Indexes:**
- `userId` (foreign key) — filter keywords by user
- `(userId, keyword)` (unique) — prevent duplicates

**Constraints:**
- `userId` is required (every keyword belongs to a user)
- `keyword` is required (cannot be NULL)
- Deleting a user cascades and deletes all their keywords

---

### Session Model

```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

**Indexes:**
- `token` (unique) — fast session lookups
- `userId` (foreign key) — find sessions by user

**Constraints:**
- `token` is unique (identifies session)
- `expiresAt` is required (session must have expiry)

---

## Relationships

```
User (1) ──────< (many) Keyword
User (1) ──────< (many) Session
```

- One user can have many keywords
- Deleting a user cascades and deletes all related keywords and sessions
- Each session belongs to exactly one user

---

## Migrations

Migrations are versioned and stored in `prisma/migrations/`.

### Creating a New Migration

After modifying `schema.prisma`:

```bash
npx prisma migrate dev --name describe_your_change
```

This:
1. Generates SQL migration file
2. Applies migration to local database
3. Regenerates Prisma client types

### Applying Migrations (Production)

```bash
npx prisma migrate deploy
```

This runs all pending migrations in order.

### Viewing Migration Status

```bash
npx prisma migrate status
```

Output shows which migrations are applied and which are pending.

---

## Prisma Studio (Database UI)

View and edit records without SQL:

```bash
npm run db:studio
# Opens http://localhost:5555
```

Features:
- Browse tables and records
- Create, edit, delete records
- Filter and search
- Inspect relationships

---

## Performance Optimization

### Indexes

Covered by schema:
- `User.email` (unique) — O(1) login lookup
- `Keyword.userId` — O(log n) filter by user
- `Keyword.(userId, keyword)` (unique) — prevent duplicates

### Query Patterns

**Fast queries:**
```typescript
// O(1): Find user by email
prisma.user.findUnique({ where: { email } });

// O(log n): Find keywords by user
prisma.keyword.findMany({ where: { userId } });

// O(1): Find session by token
prisma.session.findUnique({ where: { token } });
```

**Slow queries (avoid):**
```typescript
// O(n): Full table scan
prisma.keyword.findMany();  // WITHOUT userId filter

// O(n): Search keyword text (no index on content)
prisma.keyword.findMany({
  where: { keyword: { contains: 'search text' } }
});
```

### Query Optimization

Always filter by `userId` when reading keywords:

```typescript
// GOOD: Only user's keywords
prisma.keyword.findMany({
  where: { userId }
});

// BAD: All keywords (slow, security issue)
prisma.keyword.findMany();
```

---

## Backup & Restore

### Manual Backup

```bash
# Backup to file
docker-compose exec postgres pg_dump -U rankpanda rankpanda_dev > backup.sql

# Restore from file
docker-compose exec -T postgres psql -U rankpanda rankpanda_dev < backup.sql
```

### Automated Backups (Production)

See [DEPLOYMENT.md](DEPLOYMENT.md) → "Backup Strategy"

---

## Data Retention

No automatic data retention policies configured in Phase 1.

**Considerations for Phase 2:**
- Delete archived keywords after 90 days?
- Archive old sessions?
- Implement GDPR data deletion (right to be forgotten)?

---

## Common Operations

### Reset Database (WARNING: Deletes All Data)

```bash
npx prisma migrate reset
```

This:
1. Drops database
2. Recreates from schema
3. Runs all migrations
4. Optionally runs seed script

### Add New Field to Keyword

1. Edit `prisma/schema.prisma`:
```prisma
model Keyword {
  // ... existing fields
  difficulty String?  // New field
}
```

2. Create migration:
```bash
npx prisma migrate dev --name add_difficulty_to_keyword
```

3. Update TypeScript types (auto-generated by Prisma)

4. Update API to handle new field

### Add New Table

1. Edit `schema.prisma`:
```prisma
model CompetitorAnalysis {
  id        String   @id @default(cuid())
  keywordId String
  keyword   Keyword  @relation(fields: [keywordId], references: [id])
  // ... fields
}
```

2. Add relation in Keyword:
```prisma
model Keyword {
  // ... existing fields
  analyses CompetitorAnalysis[]
}
```

3. Create migration:
```bash
npx prisma migrate dev --name add_competitor_analysis_table
```

---

## Troubleshooting

### "PrismaClientInitializationError"

Database not running:
```bash
docker-compose up -d postgres
```

### "Migration Failed" During Deploy

1. Check current migration status:
```bash
npx prisma migrate status
```

2. Resolve conflicts (manual SQL if needed)

3. Reapply:
```bash
npx prisma migrate deploy
```

### "Column Does Not Exist"

You modified schema.prisma but forgot to create migration:
```bash
npx prisma migrate dev --name fix_missing_column
```

---

**Status:** Complete | **Version:** 1.0 | **Last Updated:** 2026-05-13
