# Flexa

Flexa is a student-facing adaptive A-level Maths practice platform. It helps students turn a wrong answer into a better next attempt by keeping the mathematical skill in focus while changing the question style, context, or representation.

The core learning loop is:

`attempt -> diagnose -> adapt -> retry -> measure improvement`

## What the app does

The dashboard gives a student a focused view of their practice:

- an adaptive session with a recommended next question set
- weekly accuracy and attempt progress
- progress across learning objectives such as SUVAT fundamentals, variable acceleration, and motion graphs
- recent practice results
- a clear explanation that the next question can change representation without changing the underlying skill

The current interface is the first usable product surface. Its system-status indicator verifies that the Next.js frontend can reach the backend and that the backend can reach its configured database.

## Architecture

Flexa is a modular full-stack application:

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, and shadcn-style UI primitives
- **Backend:** FastAPI modular monolith with versioned REST endpoints
- **Application data:** Convex with Clerk-backed authentication and typed references between users, objectives, questions, attempts, and progress
- **Health backend:** FastAPI modular monolith with a versioned health endpoint
- **Persistence:** Convex for Flexa application data; SQLAlchemy/Alembic remains available for the separate FastAPI health service
- **Local development:** SQLite is the default database for a zero-setup health check
- **Deployment target:** Vercel for the frontend, Render for the backend, and managed PostgreSQL

Clerk owns identity and sessions. Convex functions derive ownership from `ctx.auth.getUserIdentity()` and never trust a client-provided user ID. The frontend never receives `CLERK_SECRET_KEY` or database credentials.

## Flexa authentication isolation

Flexa must use its own Clerk application and instance. It must not reuse the Clerk issuer domain, publishable key, secret key, sessions, or users from Focus, Codexis, or another product.

One developer account can manage multiple Clerk applications, but each product must have its own Clerk application. A matching email address or Google account does not create a user in another product's Clerk application. The user must explicitly register or sign in to that product.

In Clerk, create or select the application named for Flexa. Enable the email/password and Google sign-in methods there. Copy only that application's keys into Flexa's environment. In Convex, set `CLERK_JWT_ISSUER_DOMAIN` to that same Flexa Clerk Frontend API URL. Do not use a shared issuer domain.

## Run locally

Install frontend dependencies:

```powershell
npm install
```

Create and install the backend environment:

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Start the API from the repository root:

```powershell
$env:PYTHONPATH="backend"
backend\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

In a second terminal, start Next.js:

```powershell
npm run dev
```

Open `http://localhost:3000`. The API health endpoint is available at `http://localhost:8000/api/v1/health`.

Set `DATABASE_URL` in `backend/.env` to use PostgreSQL. Set `NEXT_PUBLIC_API_URL` in `.env.local` when the backend runs at a non-default URL. Example files are provided in the repository root and `backend/`.

For authentication and application data, set these variables in `.env.local` and in the Convex deployment environment where noted:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk browser key
- `CLERK_SECRET_KEY`: Clerk server key; never expose it to client code
- `NEXT_PUBLIC_CONVEX_URL`: Convex deployment URL
- `CLERK_JWT_ISSUER_DOMAIN`: Clerk Frontend API URL; configure this in the Convex dashboard and use it in `convex/auth.config.ts`

Create the separate Flexa Clerk application first, then enable the Clerk Convex integration. Copy the Flexa Clerk Frontend API URL into `CLERK_JWT_ISSUER_DOMAIN`, and set the same issuer value in the Convex deployment environment. Then run `npx convex dev` to sync the schema and functions. Seed the starter content with `npx convex run seed:seedStarterData`.

The current persisted schema contains `users`, `learningObjectives`, `questions`, `attempts`, and `studentObjectiveProgress`. The authenticated functions create the current user on first session, list objectives and questions, record numerical attempts, and update objective progress. Adaptive question selection is intentionally not implemented yet.

## Quality checks

```powershell
npm run lint
npm run build
$env:PYTHONPATH="backend"
backend\.venv\Scripts\python.exe -m pytest backend\tests -q
backend\.venv\Scripts\python.exe -m alembic -c backend\alembic.ini check
```
