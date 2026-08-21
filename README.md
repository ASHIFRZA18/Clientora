# Clientora CRM Systems

> A full-stack, production-ready CRM built from the ground up — auth, role-based access control, a real-time dashboard, pipeline management, AI-assisted lead scoring, and one-click deploy configs. No boilerplate left half-finished.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

---

## 📖 Overview

Meridian CRM is a monorepo CRM application covering the full lifecycle a sales team actually needs: customer records, lead capture & scoring, a drag-and-drop deal pipeline, exportable reports, live notifications, and an optional AI co-pilot for lead qualification — all gated by real role-based permissions, not just hidden UI.

It's built as a reference-quality implementation: every module has server-side authorization, optimistic UI where it matters, and a seed script so it's never a blank screen on first run.

---

## ✨ Features

### 🔐 Authentication & Access Control
- Register / login / logout with bcrypt-hashed passwords
- JWT access tokens (in-memory) + rotating opaque refresh tokens (httpOnly cookie, with reuse detection)
- Silent session restore on page load
- Email verification & forgot/reset password flows (console mailer stub in dev)
- Full RBAC middleware — **Admin**, **Sales Manager**, **Sales Executive**

### 📊 Executive Dashboard
- Role-scoped `GET /api/v1/dashboard/overview` — reps see their own book of business, managers/admins see org-wide numbers
- Revenue, Customers, New Leads, and Deals Won cards with month-over-month deltas
- Recharts visualizations: revenue trend, pipeline funnel, cumulative customer growth
- Recent deals, today's tasks, and a live activity feed

### 👥 Customer Management
- Full CRUD with pagination, search, status filtering, and sorting — all server-side
- Repository-level scoping: reps can't see, edit, or even discover other reps' customers (returns a clean `404`, not a leaky `403`)
- Soft deletes to preserve audit history
- Detail drawer with related leads/deals and an inline notes thread

### 🎯 Lead Management & Scoring
- Full CRUD plus dedicated `assign` and `score/recalculate` actions
- Deterministic, explainable rule-based scoring engine (source quality × status × recency)
- Server-enforced assignment rules — reps can only self-claim unassigned leads
- Searchable customer picker, live score bar, inline status editing

### 🗂️ Sales Pipeline
- Kanban board powered by a single `GET /api/v1/deals/board` call, pre-sorted and pre-aggregated by stage
- Drag-and-drop (`@dnd-kit`) with optimistic updates and automatic rollback on rejection
- Correct re-sequencing on both the source and destination columns — ordering never drifts
- `closedAt` managed automatically on Won/Lost transitions

### 📈 Reports & Exports
- Revenue, Leads, Customers, and Performance reports with date-range and owner filtering
- One-click export to **CSV**, **XLSX** (styled via `exceljs`), and **PDF** (via `pdfkit`)
- Locked down to Admin / Sales Manager roles, matching the sidebar

### 🔔 Real-Time Notifications
- True push delivery via **Server-Sent Events** — no polling required
- Triggered by real domain events (lead assignment, deal won/lost, new notes) — no fake demo data
- In-process pub/sub hub with a documented upgrade path to Redis for multi-instance deployments
- Bell icon, unread badge, mark-one/mark-all-read, and a 60s polling fallback safety net

### 🤖 AI-Assisted Lead Scoring
- `POST /api/v1/leads/:id/score/ai` calls the Anthropic API directly (no SDK) for a qualitative read
- The rule-based score is fed *into* the AI prompt as context, not replaced by it
- Fails safe: rate-limited, missing API key returns a clean `503` instead of a crash, all model output validated with Zod before it touches the database
- Full UI states: empty, loading, error (with a specific "not configured" message), and populated

### 📦 Deployment-Ready
- Two real cross-domain bugs fixed *before* they'd bite in production (API base URL, `SameSite` cookie policy)
- Multi-stage Docker build for a lean production image
- Ready-made `railway.json`, `render.yaml`, and `vercel.json`
- Flat-config ESLint (TypeScript + React Hooks rules) — actually wired up, not just installed
- GitHub Actions CI: lint, typecheck, and build on every push/PR

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vite · React · TypeScript · Tailwind CSS · React Query · Zustand · React Router (lazy/code-split) · React Hook Form · Zod · Recharts |
| **Backend** | Express · TypeScript · Prisma (routes → controllers → services → repositories) |
| **Database** | PostgreSQL |
| **Realtime** | Server-Sent Events |
| **AI** | Anthropic API (Claude) |
| **Infra** | Docker · Railway / Render (API) · Vercel (Web) · GitHub Actions |

---

## 🗺️ Project Structure

```
meridian-crm/
├── apps/
│   ├── web/                # Vite + React frontend
│   │   ├── src/
│   │   │   ├── components/shared/   # DataTable, Drawer, ConfirmDialog, CustomerPicker...
│   │   │   ├── pages/
│   │   │   └── ...
│   │   └── vercel.json
│   └── api/                 # Express + Prisma backend
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── repositories/
│       │   └── lib/         # lead-scoring.ts, notification-bus.ts, ...
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       ├── Dockerfile
│       └── railway.json / render.yaml
└── .github/workflows/ci.yml
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL 16 (or Docker)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database

```bash
cp apps/api/.env.example apps/api/.env
# edit DATABASE_URL, and set JWT_ACCESS_SECRET to a long random string
```

> 💡 **AI lead scoring is optional.** Leave `ANTHROPIC_API_KEY` blank and everything else works — the "Analyze with AI" button just surfaces a clear "not configured" message. Set the key to enable real analysis.

No local Postgres? Spin one up:

```bash
docker run --name crm-postgres -e POSTGRES_USER=crm_user \
  -e POSTGRES_PASSWORD=crm_password -e POSTGRES_DB=crm_dev \
  -p 5432:5432 -d postgres:16
```

### 3. Run migrations & seed demo data

```bash
cd apps/api
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

### 4. Start everything

```bash
npm run dev
```

| Service | URL |
|---|---|
| 🌐 Web | http://localhost:5173 |
| 🔌 API | http://localhost:4000/api/v1/health |
| 🩺 Diagnostics | http://localhost:5173/status |

### 🔑 Demo accounts

Password for all: `Password123`

| Email | Role | Scope |
|---|---|---|
| `admin@meridiancrm.dev` | Admin | Org-wide dashboard |
| `manager@meridiancrm.dev` | Sales Manager | Org-wide dashboard + Reports |
| `exec@meridiancrm.dev` | Sales Executive | Own deals/customers/leads only |

---

## ☁️ Deployment

### API → Railway or Render

**Railway** — create a project from this repo (it auto-detects `railway.json` and builds via `apps/api/Dockerfile`), add a Postgres plugin, then set:

| Variable | Value |
|---|---|
| `DATABASE_URL` | from the Railway Postgres plugin |
| `JWT_ACCESS_SECRET` | a long random string |
| `WEB_ORIGIN` | your deployed Vercel URL |
| `COOKIE_SECURE` | `true` |
| `ANTHROPIC_API_KEY` | optional — enables AI lead scoring |

**Render** — push the repo; Render reads `render.yaml` and provisions the API **and** a managed Postgres instance together. Set `WEB_ORIGIN` and (optionally) `ANTHROPIC_API_KEY` after the first deploy.

Run the migration once against production either way:

```bash
DATABASE_URL="<production-url>" npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

### Web → Vercel

Import the repo, set **Root Directory** to `apps/web`, and add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://<your-api-domain>/api/v1` |

`vercel.json` handles the SPA rewrites, so deep links like `/pipeline` won't 404 on refresh.

### 🔁 Final step

Set `WEB_ORIGIN` on the API to the live Vercel URL (CORS requires an exact match) and redeploy. Optionally run `npm run prisma:seed` against production for demo accounts.

---

## 🧭 Roadmap

- [ ] Task & meeting management (Notifications' "due" and "reminder" types are already wired to hook into this)
- [ ] Team / territory management for the leads assignment picker
- [ ] Redis-backed pub/sub for multi-instance notification delivery

---

## 🤝 Contributing

Issues and PRs are welcome. Please run `npm run lint` and `npm run typecheck` before opening a pull request — CI will block on both.

---

## 📄 License

MIT © Meridian CRM Contributors
