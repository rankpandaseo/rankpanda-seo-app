# Architectural Decisions

## ADR-001: Framework Choice (Next.js vs React+Express)

**Decision:** Use **Next.js** for Phase 1 instead of separate React frontend + Express backend.

**Rationale:**
- **Unified deployment:** One Docker container, one deployment pipeline (vs. two services)
- **Less configuration:** Built-in SSR, static generation, API routes (vs. custom Express setup)
- **Faster iteration:** Hot reload works for pages + API routes
- **Type safety:** TypeScript out-of-the-box for both frontend + API
- **Production-ready:** Used by Vercel, Netflix, Hulu, etc.
- **Cost:** Simpler VPS setup (single container vs. app + backend services)

**Trade-off:** Less flexibility for microservices architecture later (Phase 2 may split).

**Reference:** [ARCHITECTURE.md](ARCHITECTURE.md) → "Layers" section

---

## ADR-002: Database Choice (PostgreSQL + Prisma)

**Decision:** Use **PostgreSQL 16** with **Prisma ORM** (not SQLite or Mongoose).

**Rationale:**
- **ACID compliance:** Transaction safety for multi-user scenarios
- **Type-safe ORM:** Prisma generates TypeScript types from schema (vs. raw SQL)
- **Multi-tenant:** Foreign keys (userId) isolate data per user
- **Performance:** Indexes on frequently queried columns (userId, email)
- **Migration strategy:** Prisma handles schema versioning (not manual SQL)

**Trade-off:** Requires PostgreSQL server (Docker handles this locally).

**Reference:** [DATABASE.md](DATABASE.md)

---

## ADR-003: Authentication Strategy (Session Cookies vs JWT)

**Decision:** Use **session-based cookies** (not JWT tokens).

**Rationale:**
- **Simpler:** Cookie is set automatically by Next.js (no manual token management)
- **No refresh tokens:** 30-day expiry avoids "refresh token" complexity
- **CSRF protection:** Built into Next.js middleware (cookies are SameSite-strict)
- **Revocation:** Easy to clear sessions in DB (JWT is harder to revoke server-side)
- **Suitable for monolithic app:** JWT shines in microservices; we don't have that yet

**Trade-off:** Not suitable if Phase 2 requires separate mobile app (JWT would be better).

**Reference:** [DEVELOPMENT.md](DEVELOPMENT.md) → "Authentication" section

---

## ADR-004: CSV Parsing Library (Papaparse)

**Decision:** Use **Papaparse** (not csv-parser or custom regex).

**Rationale:**
- **Handles edge cases:** Quoted fields, escaped commas, CRLF vs LF line endings
- **Schema validation:** Can enforce required columns
- **Performance:** Fast enough for 5k+ row imports
- **Simplicity:** NPM package, zero configuration

**Trade-off:** Papaparse is client-side focused, but works fine server-side too.

**Reference:** [API-REFERENCE.md](API-REFERENCE.md) → `/api/csv/parse` section

---

## ADR-005: Frontend Component Library (None — Plain HTML + Tailwind)

**Decision:** Use **Tailwind CSS + plain HTML** for Phase 1 (not Polaris, Shadcn/ui, or Material UI).

**Rationale:**
- **Fast prototyping:** No component library overhead
- **No SSR conflicts:** Polaris has SSR issues (requires AppProvider)
- **Lightweight:** Smaller bundle, faster CI/CD builds
- **Flexible:** Custom styling for exact designs needed
- **Migration path:** Easy to migrate to Polaris/Shadcn later if needed

**Trade-off:** Need to write more HTML/CSS ourselves.

**Reference:** [DEVELOPMENT.md](DEVELOPMENT.md) → "UI Components" section

---

## ADR-006: Deployment Architecture (Single VPS + Docker)

**Decision:** Deploy to **single Ubuntu VPS** (76.13.58.79) with **Docker + Nginx**.

**Rationale:**
- **Cost-effective:** $5-10/month VPS (vs. Vercel $20+)
- **Control:** Full server access for custom configurations
- **Flexibility:** Can add services later (Redis, RabbitMQ, Webhooks)
- **Backup strategy:** Daily database backups to external storage

**Trade-off:** Manual DevOps vs. managed Vercel (but DEPLOYMENT.md makes it reproducible).

**Reference:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

## ADR-007: Two-Repository Strategy (Old vs New)

**Decision:** Maintain **two separate GitHub repositories:**
- **Old repo** (`rankpanda_seo_app`): Shopify CLI app (read-only reference)
- **New repo** (`rankpanda-seo-app`): Phase 1 web app (production)

**Rationale:**
- **Clean history:** New repo starts fresh (no Shopify baggage)
- **Reference:** Old repo available if Phase 2 needs Shopify OAuth patterns
- **Parallel development:** Phase 1 and Phase 2 can coexist without merge conflicts
- **Clarity:** Clear separation of concerns (web app vs Shopify app)

**Trade-off:** Two remotes to manage.

**Reference:** [README.md](README.md) → "Repository Strategy" section

---

## ADR-008: Credential Management (GitHub Secrets + .env Files)

**Decision:** Use **GitHub Secrets** for CI/CD deployments, **`.env` files** for local dev (never committed).

**Rationale:**
- **CI/CD:** GitHub Actions fetch secrets, inject into `.env` during deployment
- **Local dev:** `.env.local` or `.env` (from `.env.example` template)
- **Security:** No secrets in git history or logs
- **Simplicity:** No external secret manager (Vault, AWS Secrets) complexity yet

**Trade-off:** Manual secret rotation. If needed later, add HashiCorp Vault.

**Reference:** [DEVELOPMENT.md](DEVELOPMENT.md) → "Environment Setup" section

---

## ADR-009: Testing Strategy (Jest + Vitest)

**Decision:** Use **Jest** for unit + integration tests (not Mocha or Vitest).

**Rationale:**
- **Standard:** Most popular for Node.js + React
- **Coverage:** Built-in coverage reporting (target: ≥80%)
- **Snapshot testing:** Good for UI component testing
- **CI integration:** GitHub Actions runs tests automatically

**Trade-off:** Jest can be slower for large test suites (but fine for Phase 1).

**Reference:** [TESTING.md](TESTING.md)

---

## ADR-010: Secrets Rotation Policy

**Decision:** Rotate **SESSION_SECRET** and **DB_PASSWORD** every **90 days** (or if compromised).

**Rationale:**
- **Security best practice:** Reduces window of exposure if leaked
- **Automation:** GitHub Actions can trigger rotation via scheduled workflow
- **Alerting:** Monitor for failed login attempts / suspicious activity

**Reference:** [DEPLOYMENT.md](DEPLOYMENT.md) → "Maintenance" section

---

## Phase 2 Considerations (Not Implemented Yet)

When integrating Shopify (Phase 2), these decisions will be revisited:

1. **OAuth vs API Key:** Shopify OAuth (user installs app) vs. private API key (manual config)
   - Current decision: OAuth (standard for Shopify apps)
2. **Separate backend:** May split into microservices if keyword processing becomes heavy
   - Current: Monolithic Next.js (sufficient for Phase 1)
3. **JWT tokens:** If mobile app needed, switch to JWT
   - Current: Session cookies (sufficient for Phase 1)
4. **Caching layer:** If traffic increases, add Redis
   - Current: None (PostgreSQL sufficient for Phase 1)

---

**Status:** Final | **Version:** 1.0 | **Last Updated:** 2026-05-13
