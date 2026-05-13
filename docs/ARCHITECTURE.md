# System Architecture

## Overview

RankPanda Phase 1 is a standalone web SaaS application for semantic keyword research and SEO analysis. Built with **Next.js** (fullstack SSR) and **PostgreSQL**, it provides user authentication, multi-tenant keyword management, and CSV import/export workflows.

```
┌─────────────────────────────────────────┐
│          Browser (Next.js SSR)          │
│  Pages: login, signup, dashboard, etc   │
└────────────────┬────────────────────────┘
                 │ HTTPS (Nginx + SSL)
                 │
        ┌────────▼──────────┐
        │   Nginx Proxy     │
        │ (SSL termination) │
        └────────┬──────────┘
                 │
        ┌────────▼──────────────┐
        │  Next.js Container    │
        │  API Routes + Pages   │
        │  (Port 3000)          │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────┐
        │  PostgreSQL 16    │
        │  (Port 5432)      │
        └───────────────────┘
```

## Layers

### 1. **Frontend (SSR via Next.js pages/)**

- **Pages:** React components rendered on server (SSR) or statically (SSG)
  - `/login` — Authentication page
  - `/signup` — User registration
  - `/dashboard` — Main app (protected, requires session)
  - `/keywords` — Keyword list, search, management
  - `/csv-upload` — CSV importer with progress
  - `/settings` — User preferences
- **Components:** Reusable React UI blocks
  - `Auth/` — LoginForm, SignUpForm, ProtectedRoute
  - `Keywords/` — KeywordTable, KeywordSearch, KeywordStats
  - `CSV/` — CSVUploader, CSVPreview, ImportProgress
  - `Layout/` — Header, Sidebar, MainLayout
  - `Common/` — Button, Input, Modal, Spinner

### 2. **API Routes (pages/api/)**

- **Auth endpoints** (`/api/auth/*`)
  - POST `/api/auth/signin` — Email + password login
  - POST `/api/auth/signup` — Email + password registration
  - POST `/api/auth/logout` — Clear session
  - GET `/api/auth/session` — Get current user
- **Keywords endpoints** (`/api/keywords/*`)
  - GET `/api/keywords` — List all user's keywords
  - POST `/api/keywords` — Bulk import keywords (CSV)
  - DELETE `/api/keywords/[id]` — Remove keyword
- **CSV endpoints** (`/api/csv/*`)
  - POST `/api/csv/parse` — Parse + validate CSV file
- **Health** (`/api/health`)
  - GET `/api/health` — Liveness check (container health)

### 3. **Database (Prisma + PostgreSQL)**

**Schemas:**

```prisma
model User {
  id         String   @id @default(cuid())
  email      String   @unique
  password   String   // bcryptjs hashed
  createdAt  DateTime @default(now())
  
  keywords   Keyword[]
  sessions   Session[]
}

model Keyword {
  id          String   @id @default(cuid())
  userId      String   @unique  // Multi-tenant FK
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  keyword     String
  searchVolume Int?
  intent      String?  // informational, commercial, transactional
  status      String?  // active, archived
  createdAt   DateTime @default(now())
  
  @@index([userId])  // Fast user lookups
}

model Session {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

### 4. **Authentication**

- **Method:** Session-based cookies (not JWT)
- **Hashing:** bcryptjs (10 rounds, production-grade)
- **Storage:** PostgreSQL sessions table
- **Expiry:** 30 days from login
- **Security:** HttpOnly + Secure flags prevent XSS/MITM

### 5. **CSV Parsing**

- **Library:** Papaparse (npm install papaparse)
- **Formats supported:** Semrush, Google Search Console, DataForSEO, SE Ranking
- **Validation:** Schema checking (keyword column required)
- **Flow:** Upload → Parse → Validate → Import → Store in DB

## Data Flow

### Sign Up Flow
```
1. User fills signup form (email, password)
2. Frontend POST /api/auth/signup
3. API: Hash password (bcryptjs), create User, create Session
4. API: Set session cookie, redirect to /dashboard
5. Frontend: Dashboard page renders (SSR with user context)
```

### CSV Import Flow
```
1. User uploads CSV file
2. Frontend POST /api/csv/parse
3. API: Parse CSV with Papaparse, validate schema
4. API: Return preview (sample rows + validation errors)
5. User confirms import
6. Frontend POST /api/keywords (with CSV data)
7. API: Bulk insert into Keyword table (with userId FK)
8. Frontend: Refetch /api/keywords, display new keywords
```

## Deployment

### Local Development
```bash
docker-compose up -d postgres   # Start PostgreSQL
npm run dev                      # Next.js on http://localhost:3000
npm run test                     # Jest tests
```

### Production (VPS)
```bash
# On VPS (76.13.58.79)
docker-compose -f docker-compose.prod.yml up -d
# Migrations
docker-compose exec app npx prisma migrate deploy
# Nginx + SSL configuration (see DEPLOYMENT.md)
```

## Key Design Decisions

1. **Next.js over Express+React:** Unified deployment (no separate backend), faster iteration, built-in SSR
2. **PostgreSQL:** ACID compliance, multi-tenant support, Prisma ORM
3. **Session cookies:** Simpler than JWT for monolithic app, no token refresh hassle
4. **Prisma migrations:** Type-safe schema changes, built-in CLI

See [DECISIONS.md](DECISIONS.md) for full architectural rationale.

---

**Status:** Production-ready | **Version:** 1.0 | **Last Updated:** 2026-05-13
