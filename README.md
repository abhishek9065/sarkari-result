# Sarkari Hub (Full-Stack Starter)

A modernized take on SarkariResult with a TypeScript Express API, PostgreSQL-ready persistence, and a React + Vite frontend.

## Stack
- Backend: Node.js, Express, TypeScript, pg, Zod, JWT-ready
- Frontend: React 18, Vite, TypeScript
- Database: PostgreSQL (connection via `DATABASE_URL`)

## Quickstart
1. **Backend**
   - Copy env: `cp backend/.env.example backend/.env`
   - Install deps: `cd backend && npm install`
   - Run dev API: `npm run dev`
   - Health check: `GET http://localhost:5000/api/health`
2. **Frontend**
   - Install deps: `cd frontend && npm install`
   - Run dev UI: `npm run dev`
   - UI served at: `http://localhost:4173` (proxy to backend `/api`)

## Configuration
- Backend env vars: see `backend/.env.example`
- Frontend can point to a remote API by setting `VITE_API_BASE` (defaults to same origin)

## Notes / Next Steps
- Wire PostgreSQL schema + migrations (jobs/results/admit cards tables, auth users, bookmarks).
- Replace mock in-memory announcements with DB queries.
- Add authentication, admin posting dashboard, and search facets.
- Harden validation and logging; add tests.
