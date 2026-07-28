# Meridian CRM — Phase 1, 2 & 3: Setup, Auth & Dashboard

A monorepo scaffold with the frontend, backend, and database wired end-to-end, complete authentication, and a role-aware executive dashboard.

## Stack

- `apps/web` — Vite + React + TypeScript + Tailwind (design tokens configured) + React Query + Zustand + React Router (lazy-loaded, code-split routes) + React Hook Form + Zod + Recharts
- `apps/api` — Express + TypeScript + Prisma, layered as routes → controllers → services → repositories
- PostgreSQL via Prisma, full normalized schema for Users, Customers, Leads, Deals, Tasks, Meetings, Notes, Activities, Notifications, Audit Logs, and RefreshTokens

## What's included

### Phase 1 — Project setup
A `/status` route renders a live **System Status** page that calls `GET /api/v1/health`, round-tripping a query to Postgres, proving the whole stack is wired correctly.

### Phase 2 — Authentication
- Register / Login / Logout with bcrypt password hashing
- JWT access tokens (in memory) + opaque refresh tokens (httpOnly cookie, rotated with reuse detection)
- Silent session restore on page load
- Email verification and forgot/reset password flows (dev-mode console mailer stub)
- RBAC middleware ready for role-gated routes
- Fully styled auth pages sharing a premium split-panel layout

### Phase 3 — Dashboard
- **App shell**: role-aware sidebar (Admin/Manager see Reports and Audit Logs nav items; all roles see Dashboard, Customers, Leads, Pipeline, Tasks) + topbar with user menu
- **`GET /api/v1/dashboard/overview`** — a single role-scoped aggregate endpoint. Sales Executives see only their own book of business (deals/customers/leads they own); Admins and Sales Managers see org-wide numbers
- **Overview cards**: Revenue, Customers, New Leads, Deals Won — each with a month-over-month delta
- **Charts** (Recharts): revenue trend (6-month area chart), sales pipeline funnel (stage breakdown), customer growth (cumulative line chart)
- **Recent deals**, **today's tasks**, and a **live activity timeline**
- **Seed script** (`prisma/seed.ts`) populates realistic demo data — three users across all three roles, customers, leads, deals spread across every pipeline stage and the last 6 months, and tasks — so the dashboard isn't empty on first run

Nav items for Customers, Leads, Pipeline, Tasks, and Reports are visible but marked "Soon" — they route to real pages starting Phase 4.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database

```bash
cp apps/api/.env.example apps/api/.env
# edit DATABASE_URL, and set JWT_ACCESS_SECRET to a long random string
```

If you don't have Postgres running locally:

```bash
docker run --name crm-postgres -e POSTGRES_USER=crm_user \
  -e POSTGRES_PASSWORD=crm_password -e POSTGRES_DB=crm_dev \
  -p 5432:5432 -d postgres:16
```

### 3. Run the initial migration and seed demo data

```bash
cd apps/api
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

### 4. Run everything

From the repo root:

```bash
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:4000/api/v1/health
- Diagnostics: http://localhost:5173/status

Log in with any of the seeded demo accounts (password `Password123`):

| Email | Role |
|---|---|
| `admin@meridiancrm.dev` | Admin — org-wide dashboard |
| `manager@meridiancrm.dev` | Sales Manager — org-wide dashboard + Reports nav |
| `exec@meridiancrm.dev` | Sales Executive — scoped to their own deals/customers/leads |

## What's next

| Phase | Scope |
|---|---|
| 4 | Customers — CRUD, DataTable, filters |
| 5 | Leads — scoring, assignment |
| 6 | Pipeline — drag-and-drop Kanban |
| 7 | Reports — PDF/Excel/CSV export |
| 8 | Notifications — real-time |
| 9 | AI lead scoring |
| 10 | Deployment (Vercel + Railway) |
