# Testing Strategy

## Overview

Phase 1 uses **three layers** of testing:

1. **Unit tests** — Test individual functions/components
2. **Integration tests** — Test API routes with database
3. **E2E tests** — Test full user workflows via browser

## Test Frameworks

| Layer | Framework | Command |
|-------|-----------|---------|
| Unit | Jest | `npm test` |
| Integration | Jest + node-mocks-http | `npm test` |
| E2E | Playwright | `npm run test:e2e` |

## Running Tests

```bash
# Run all tests once
npm test

# Run in watch mode (re-run on file changes)
npm test -- --watch

# Run specific test file
npm test auth.test.ts

# Run with coverage report
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

## Unit Tests

Test individual functions in isolation.

**File:** `tests/unit/auth.test.ts`

```typescript
import { hashPassword, comparePassword } from '@/lib/auth';

describe('auth', () => {
  it('should hash and verify password', async () => {
    const password = 'mypassword';
    const hash = await hashPassword(password);
    const matches = await comparePassword(password, hash);
    expect(matches).toBe(true);
  });

  it('should fail on wrong password', async () => {
    const hash = await hashPassword('mypassword');
    const matches = await comparePassword('wrongpassword', hash);
    expect(matches).toBe(false);
  });
});
```

**Best Practices:**
- One `describe` block per function/module
- One `it` block per assertion
- Use descriptive test names
- Mock external dependencies (APIs, DB)
- Test edge cases and error conditions

---

## Integration Tests

Test API routes with real database (local PostgreSQL).

**File:** `tests/integration/keywords-api.test.ts`

```typescript
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/keywords/index';
import { prisma } from '@/lib/db';

describe('/api/keywords', () => {
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'hashedpassword'
      }
    });
    userId = user.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.keyword.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it('GET should return user keywords', async () => {
    // Create test keyword
    const keyword = await prisma.keyword.create({
      data: {
        userId,
        keyword: 'test keyword',
        searchVolume: 100
      }
    });

    // Mock request
    const { req, res } = createMocks({
      method: 'GET',
      query: {}
    });

    // Mock session
    req.session = { userId };

    // Call handler
    await handler(req, res);

    // Assertions
    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.keywords).toContainEqual(
      expect.objectContaining({ keyword: 'test keyword' })
    );
  });

  it('POST should import keywords', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        keywords: [
          { keyword: 'keyword 1', searchVolume: 100 }
        ]
      }
    });

    req.session = { userId };
    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const body = JSON.parse(res._getData());
    expect(body.imported).toBe(1);
  });
});
```

**Best Practices:**
- Use `beforeEach` and `afterEach` for setup/cleanup
- Create test data in database
- Test both success and error paths
- Use meaningful assertions
- Verify database state after operations

---

## E2E Tests

Test complete user workflows via browser.

**File:** `tests/e2e/signup-login-upload.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test('signup → login → import keywords → logout', async ({ page }) => {
  // Sign up
  await page.goto('http://localhost:3000/signup');
  await page.fill('input[name=email]', `test-${Date.now()}@example.com`);
  await page.fill('input[name=password]', 'password123');
  await page.fill('input[name=confirmPassword]', 'password123');
  await page.click('button[type=submit]');
  
  // Verify dashboard loaded
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');

  // Go to CSV upload
  await page.click('a:has-text("Upload CSV")');
  await expect(page).toHaveURL('http://localhost:3000/csv-upload');

  // Upload test CSV
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('tests/fixtures/keywords.csv');
  await page.click('button:has-text("Import")');

  // Verify keywords imported
  await expect(page.locator('.success-message')).toContainText('Imported successfully');

  // Go to keywords list
  await page.click('a:has-text("Keywords")');
  await expect(page.locator('table')).toBeDefined();

  // Logout
  await page.click('button:has-text("Logout")');
  await expect(page).toHaveURL('http://localhost:3000/login');
});
```

**Best Practices:**
- Test user-visible flows (sign up, login, data entry, logout)
- Use meaningful selectors (avoid brittle `nth-child`)
- Wait for elements (built-in via Playwright)
- Take screenshots on failure (auto-saved)
- Keep tests independent (no test should depend on another's state)

---

## Test Data (Fixtures)

**File:** `tests/fixtures/keywords.csv`

```csv
keyword,searchVolume,intent
semantic keyword research,1200,informational
keyword clustering tool,850,transactional
content gap analysis,600,informational
```

**File:** `tests/fixtures/test-user.json`

```json
{
  "email": "test@example.com",
  "password": "testpassword123"
}
```

---

## Coverage Goals

Target **≥80% code coverage** for Phase 1:

```bash
npm test -- --coverage
```

Output:
```
File                  | Statements | Branches | Functions | Lines
-------------------  | ---------- | -------- | --------- | -----
All files             |     82.5%  |   78.3%  |   85.2%   | 81.9%
lib/auth.ts           |    100%    |   100%   |   100%    | 100%
pages/api/auth/*.ts   |     90%    |    85%   |    92%    |  89%
lib/csv-parser.ts     |     75%    |    70%   |    78%    |  74%
```

---

## Common Test Patterns

### Mock Database (Unit Test)

```typescript
import { prismaMock } from 'jest-mock-extended';

it('should return user by email', async () => {
  prismaMock.user.findUnique.mockResolvedValue({
    id: 'user1',
    email: 'test@example.com',
    password: 'hashed'
  });

  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });

  expect(user?.email).toBe('test@example.com');
});
```

### Mock External API

```typescript
import fetch from 'jest-mock-fetch';

it('should fetch keywords from external API', async () => {
  fetch.mockResponseOnce(JSON.stringify({ keywords: [...] }));
  
  const result = await fetchExternalKeywords('query');
  
  expect(result).toHaveLength(10);
});
```

### Test Error Handling

```typescript
it('should return 401 if not authenticated', async () => {
  const { req, res } = createMocks({
    method: 'GET'
    // No session cookie
  });

  await handler(req, res);
  
  expect(res._getStatusCode()).toBe(401);
  expect(JSON.parse(res._getData()).error).toBe('Not authenticated');
});
```

---

## Continuous Integration (CI)

GitHub Actions runs tests on every push to `main`:

**File:** `.github/workflows/ci.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

---

## Troubleshooting Tests

### Tests Timeout

Increase timeout in jest config:
```javascript
module.exports = {
  testTimeout: 10000  // 10 seconds
};
```

### Database Locked

Ensure `afterEach` cleanup runs:
```typescript
afterEach(async () => {
  await prisma.keyword.deleteMany({ where: { userId } });
});
```

### Port Already in Use (E2E)

Another test is using port 3000:
```bash
lsof -i :3000
kill -9 <PID>
npm run test:e2e
```

### Mock Not Working

Ensure mock is defined before import:
```typescript
jest.mock('@/lib/auth'); // Before any imports

import { hashPassword } from '@/lib/auth'; // After mock
```

---

**Status:** Complete | **Version:** 1.0 | **Last Updated:** 2026-05-13
