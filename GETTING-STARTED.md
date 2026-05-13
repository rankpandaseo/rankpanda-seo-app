# Getting Started for New Developers

Welcome! This guide walks you through setting up Phase 1 locally from scratch.

## Prerequisites

Make sure you have installed:
- **Node.js 18+** (`node --version`)
- **npm 9+** (`npm --version`)
- **Docker Desktop** ([download](https://www.docker.com/products/docker-desktop))
- **Git** (`git --version`)

## Step 1: Clone Repository

```bash
git clone https://github.com/rankpandaseo/rankpanda-seo-app.git
cd rankpanda-seo-app
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs all Node.js packages listed in `package.json`.

## Step 3: Set Up Environment

```bash
cp .env.example .env.local
```

For local development, the defaults in `.env.local` should work. You can edit it if needed:

```bash
DATABASE_URL=postgresql://rankpanda:rankpanda@localhost:5432/rankpanda_dev
SESSION_SECRET=dev-secret-change-in-production
NODE_ENV=development
PORT=3000
```

## Step 4: Start PostgreSQL

Open a terminal and run:

```bash
docker-compose up -d postgres
```

Verify it's running:
```bash
docker-compose ps
```

You should see `rankpanda_postgres` with status `Up`.

## Step 5: Set Up Database

In your original terminal, run migrations:

```bash
npx prisma migrate dev
```

This creates the database schema. If prompted to create a migration, press Enter (no migrations exist yet).

## Step 6: Start Development Server

```bash
npm run dev
```

You'll see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Step 7: Open in Browser

Visit **http://localhost:3000** in your browser.

You should see the login page.

## Step 8: Test Sign Up

1. Click "Sign Up"
2. Enter email: `test@example.com`
3. Enter password: `testpassword123`
4. Click "Sign Up"
5. You should be redirected to `/dashboard`

## Step 9: Test Login/Logout

1. Click "Logout" (top right)
2. You should be back at `/login`
3. Click "Sign In"
4. Enter same email and password
5. You should be back at `/dashboard`

**Congratulations!** Your local setup is working.

## Next Steps

### Make a Code Change

1. Open `pages/dashboard.tsx`
2. Change the heading text
3. Save the file
4. Browser should auto-refresh (hot reload)

### Run Tests

```bash
npm test
```

This runs Jest tests. Should show `0 tests` initially (no tests yet).

### Inspect Database

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555. You can view your test user here.

### Stop Everything

```bash
# Stop development server
Ctrl+C

# Stop PostgreSQL
docker-compose down
```

## Troubleshooting

### Port 3000 Already in Use

```bash
lsof -i :3000
kill -9 <PID>
npm run dev
```

### PostgreSQL Connection Error

```bash
docker-compose logs postgres
docker-compose restart postgres
```

### npm install Failed

```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Migration Failed

```bash
npx prisma migrate reset  # WARNING: deletes all data
npx prisma migrate dev
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `pages/` | React pages (routes) |
| `pages/api/` | API endpoints |
| `components/` | Reusable UI components |
| `lib/` | Utilities (auth, validation, types) |
| `prisma/schema.prisma` | Database schema |
| `.env.local` | Local environment variables (never commit) |
| `package.json` | Project dependencies + scripts |

## Documentation

- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Full development guide
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System design
- **[API-REFERENCE.md](docs/API-REFERENCE.md)** — API endpoint details
- **[DECISIONS.md](docs/DECISIONS.md)** — Why we chose each technology

## Common Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm test              # Run tests
npm run lint          # Check code style
npm run db:studio     # Open database UI
npx prisma migrate dev  # Create migration
```

## Need Help?

1. Check [DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed guides
2. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common errors
3. Open an issue on GitHub with detailed error message and reproduction steps

---

**Questions?** Reach out to the team. Happy coding!
