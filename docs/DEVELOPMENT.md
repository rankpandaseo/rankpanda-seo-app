# Development Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
# Edit .env.local if needed (defaults should work for local dev)
```

### 3. Start PostgreSQL (Docker)

```bash
docker-compose up -d postgres
```

Verify it's running:
```bash
docker-compose ps postgres
```

### 4. Run Migrations

```bash
npx prisma migrate dev
# This creates database schema and populates `prisma/migrations/`
```

### 5. Start Development Server

```bash
npm run dev
```

Open **http://localhost:3000** in browser.

- Frontend renders on first request
- API routes available at `/api/*`
- Hot reload enabled (changes auto-refresh)

## Available Scripts

```bash
npm run dev          # Start development server (Next.js on :3000)
npm run build        # Production build
npm start            # Start production server (requires `npm run build` first)
npm test             # Run Jest tests
npm test -- --watch  # Run tests in watch mode
npm run test:e2e     # Run Playwright end-to-end tests
npm run lint         # Run ESLint
npm run db:studio    # Open Prisma Studio (database UI)
npm run db:seed      # Populate test data (if seed.ts exists)
```

## Project Structure

```
pages/
├── _app.tsx              # App wrapper, layout
├── _document.tsx         # HTML document template
├── index.tsx             # Home page
├── login.tsx             # Login form
├── signup.tsx            # Sign-up form
├── dashboard.tsx         # Main authenticated page
├── keywords.tsx          # Keyword list
├── csv-upload.tsx        # CSV importer
├── settings.tsx          # User settings
├── 404.tsx               # Custom 404 page
└── api/
    ├── auth/
    │   ├── signin.ts     # POST login
    │   ├── signup.ts     # POST register
    │   ├── logout.ts     # POST logout
    │   └── session.ts    # GET current user
    ├── keywords/
    │   ├── index.ts      # GET list, POST import
    │   └── [id].ts       # DELETE keyword
    ├── csv/
    │   └── parse.ts      # POST parse CSV
    └── health.ts         # GET health check

components/
├── Auth/
│   ├── LoginForm.tsx
│   ├── SignUpForm.tsx
│   └── ProtectedRoute.tsx
├── Keywords/
│   ├── KeywordTable.tsx
│   ├── KeywordSearch.tsx
│   └── KeywordStats.tsx
├── CSV/
│   ├── CSVUploader.tsx
│   ├── CSVPreview.tsx
│   └── ImportProgress.tsx
├── Layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── MainLayout.tsx
└── Common/
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    └── Spinner.tsx

lib/
├── db.ts             # Prisma client singleton
├── auth.ts           # Password hashing, verification
├── csv-parser.ts     # CSV parsing utilities
├── validation.ts     # Form validation
└── types.ts          # TypeScript types

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Migration files (auto-generated)

tests/
├── unit/             # Unit tests
├── integration/      # API integration tests
├── e2e/              # End-to-end tests
└── fixtures/         # Test data

public/               # Static files (favicon, logo)
styles/               # CSS (Tailwind)
```

## Authentication Flow

### Sign Up

```
User fills form (email, password)
    ↓
POST /api/auth/signup
    ↓
API: Hash password with bcryptjs
API: Create User in DB
API: Create Session with 30-day expiry
API: Set session cookie (HttpOnly, Secure)
    ↓
Redirect to /dashboard
```

### Login

```
User fills form (email, password)
    ↓
POST /api/auth/signin
    ↓
API: Find User by email
API: Compare password hash
API: Create Session with 30-day expiry
API: Set session cookie
    ↓
Redirect to /dashboard
```

### Protected Pages

All pages under `/dashboard`, `/keywords`, `/settings` require valid session cookie. If missing, redirect to `/login`.

## Database

### Schema Inspection

```bash
npm run db:studio
# Opens Prisma Studio (web UI) at http://localhost:5555
# View, edit, and delete records in real-time
```

### Running Migrations

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name add_user_table

# Deploy existing migrations (production)
npx prisma migrate deploy

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

### Seeding Test Data

**Create `prisma/seed.ts`:**

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'hashed_password_here',
    },
  });

  console.log('Seeded user:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
npx prisma db seed
```

## Testing

### Unit Tests (Jest)

```bash
npm test
```

**Example test file (`tests/unit/auth.test.ts`):**

```typescript
import { hashPassword, comparePassword } from '@/lib/auth';

describe('auth', () => {
  it('should hash password and verify', async () => {
    const password = 'mypassword';
    const hash = await hashPassword(password);
    const matches = await comparePassword(password, hash);
    expect(matches).toBe(true);
  });
});
```

### Integration Tests

**Example test (`tests/integration/keywords-api.test.ts`):**

```typescript
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/keywords/index';

describe('/api/keywords', () => {
  it('GET should return keywords for authenticated user', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: { cookie: 'session=valid_token' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

**Example test (`tests/e2e/signup-login.test.ts`):**

```typescript
import { test, expect } from '@playwright/test';

test('signup and login flow', async ({ page }) => {
  // Visit signup page
  await page.goto('http://localhost:3000/signup');
  
  // Fill form
  await page.fill('input[name=email]', 'test@example.com');
  await page.fill('input[name=password]', 'password123');
  
  // Submit
  await page.click('button[type=submit]');
  
  // Should redirect to dashboard
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
});
```

## TypeScript

### Type Definitions

**`lib/types.ts`:**

```typescript
export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface Keyword {
  id: string;
  userId: string;
  keyword: string;
  searchVolume?: number;
  intent?: string;
  status?: string;
  createdAt: Date;
}

export interface Session {
  userId: string;
  expiresAt: Date;
}
```

### API Route Types

```typescript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Handle POST
  } else {
    res.status(405).end();
  }
}
```

## Debugging

### Enable Debug Logs

```bash
DEBUG=* npm run dev
```

### Prisma Debug Mode

```bash
DEBUG="prisma:*" npm run dev
```

### Browser DevTools

- F12 in browser
- Network tab to inspect API calls
- Console for JavaScript errors

### VS Code Debugging

**`.vscode/launch.json`:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Common Issues

### Issue: "Cannot find module '@prisma/client'"

**Solution:** Run `npm install` first.

### Issue: "listen EADDRINUSE: address already in use :::3000"

**Solution:** Another process is using port 3000:
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it
```

### Issue: PostgreSQL connection refused

**Solution:** Make sure Docker container is running:
```bash
docker-compose up -d postgres
```

### Issue: Prisma migrations fail

**Solution:** Reset database (WARNING: deletes all data):
```bash
npx prisma migrate reset
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# Test locally (npm test)

# Commit
git commit -m "feat: add my feature"

# Push
git push origin feature/my-feature

# Create PR on GitHub
# After merge, delete branch
git checkout main
git pull origin main
git branch -d feature/my-feature
```

---

**Status:** Complete | **Version:** 1.0 | **Last Updated:** 2026-05-13
