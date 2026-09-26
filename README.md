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
- **Persistence:** SQLAlchemy and Alembic, configured for PostgreSQL in deployed environments
- **Local development:** SQLite is the default database for a zero-setup health check
- **Deployment target:** Vercel for the frontend, Render for the backend, and managed PostgreSQL

The frontend never receives database credentials. It calls the backend through the API client in `lib/api.ts`.

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

## Quality checks

```powershell
npm run lint
npm run build
$env:PYTHONPATH="backend"
backend\.venv\Scripts\python.exe -m pytest backend\tests -q
backend\.venv\Scripts\python.exe -m alembic -c backend\alembic.ini check
```
