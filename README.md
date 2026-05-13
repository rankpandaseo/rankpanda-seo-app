# RankPanda Phase 1 — Web SaaS Keyword Research Platform

**Standalone web application for semantic keyword research, built with Next.js + PostgreSQL.**

Phase 1 is a production-ready web SaaS for uploading, analyzing, and managing keywords. Phase 2 (Shopify integration) will add OAuth app installation into client stores.

## Quick Start

### For New Developers

👉 **Start here:** [GETTING-STARTED.md](GETTING-STARTED.md)

```bash
git clone https://github.com/rankpandaseo/rankpanda-seo-app.git
cd rankpanda-seo-app
npm install
docker-compose up -d postgres
npx prisma migrate dev
npm run dev
```

Visit **http://localhost:3000** and sign up.

### For DevOps / Deployment

👉 **Read:** [DEPLOYMENT.md](docs/DEPLOYMENT.md)

```bash
# On VPS
docker-compose -f docker-compose.prod.yml up -d
docker-compose exec app npx prisma migrate deploy
# Configure Nginx + SSL (see DEPLOYMENT.md)
```

## Documentation

| Doc | Purpose |
|-----|---------|
| **[GETTING-STARTED.md](GETTING-STARTED.md)** | Step-by-step setup for new developers |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | System design, layers, data flow |
| **[DECISIONS.md](docs/DECISIONS.md)** | Why we chose Next.js, PostgreSQL, sessions, etc |
| **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** | Local development, debugging, TypeScript |
| **[API-REFERENCE.md](docs/API-REFERENCE.md)** | All endpoints: auth, keywords, CSV, health |
| **[DATABASE.md](docs/DATABASE.md)** | Schema, migrations, performance tuning |
| **[TESTING.md](docs/TESTING.md)** | Unit, integration, E2E test strategies |
| **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** | Production VPS setup, SSL, backups, monitoring |

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 14+ (React SSR) |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL 16 + Prisma ORM |
| **Authentication** | bcryptjs + session cookies |
| **Styling** | Tailwind CSS |
| **Testing** | Jest (unit/integration) + Playwright (E2E) |
| **Deployment** | Docker + Nginx + Let's Encrypt |

## Key Features

- ✅ **Email/Password authentication** — Sign up, login, logout
- ✅ **Multi-tenant architecture** — Each user manages their own keywords
- ✅ **CSV import** — Upload keywords from Semrush, GSC, DataForSEO, SE Ranking
- ✅ **Keyword management** — Search, filter, delete
- ✅ **Session persistence** — 30-day login sessions
- ✅ **Production Docker setup** — Single container, PostgreSQL, health checks
- ✅ **Type-safe API** — TypeScript for frontend + backend
- ✅ **Full test coverage** — Unit, integration, E2E tests (target ≥80%)

## Getting Help

- **[GETTING-STARTED.md](GETTING-STARTED.md)** — Local setup
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Development guide
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Production deployment

---

**Status:** Phase 1 — Production Ready | **Last Updated:** 2026-05-13
