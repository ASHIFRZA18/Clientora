# Meridian CRM — Phase 1–8: Setup, Auth, Dashboard, Customers, Leads, Pipeline, Reports & Notifications

A monorepo scaffold with the frontend, backend, and database wired end-to-end, complete authentication, a role-aware executive dashboard, full customer management, and lead tracking with scoring and assignment.

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

### Phase 4 — Customers
- **`GET/POST /api/v1/customers`**, **`GET/PATCH/DELETE /api/v1/customers/:id`**, plus notes at **`/api/v1/customers/:id/notes`** — full CRUD with server-side pagination, search (name/company/email), status filtering, and sorting
- **Role-scoped at the repository layer**: Sales Executives only ever see, edit, or delete customers they own; trying to access someone else's by ID returns a clean 404, not a 403 that would confirm the record exists
- Only Admins/Sales Managers may assign a customer to a different owner; soft delete (`deletedAt`) keeps records for audit/reporting instead of hard-deleting
- **Customers page**: debounced search, status filter, sortable columns, pagination — built on new reusable primitives (`DataTable`, `Drawer`, `ConfirmDialog`, `Pagination`, `Select`)
- **Create/edit drawer** and a **detail drawer** showing related leads/deals plus an inline notes thread
- Sidebar nav and the dashboard's "New customer" quick action now link to a real, working page

### Phase 5 — Leads
- **`GET/POST /api/v1/leads`**, **`GET/PATCH/DELETE /api/v1/leads/:id`**, **`PATCH /api/v1/leads/:id/assign`**, **`POST /api/v1/leads/:id/score/recalculate`** — full CRUD plus dedicated assignment and scoring actions
- **Rule-based lead scoring** (`lib/lead-scoring.ts`): a deterministic, explainable function combining source quality, pipeline status, and recency — built as a pure function so the real AI model in Phase 9 can call it as a fallback/floor instead of replacing it outright
- **Assignment rules enforced server-side**: Admins/Sales Managers can assign any lead to anyone; Sales Executives can only self-claim an *unassigned* lead — creating a lead as an executive force-assigns it to yourself no matter what the request body says, and claiming someone else's lead returns a clean 403
- **Leads page**: search (matches source, customer name, or company), status filter, sortable columns (score/status/created), pagination
- **Searchable customer picker** for the create-lead form — since every lead must belong to a customer
- **Detail drawer** with inline status editing, a live score bar with a "Recalculate" action, and self-assign/unassign controls
- Sidebar nav and the dashboard's "New lead" quick action now link to a real, working page

Nav items for Tasks and Audit Logs are visible but marked "Soon" — they route to real pages in a later phase.

### Phase 6 — Pipeline
- **`GET /api/v1/deals/board`** returns all deals grouped by stage, each column pre-sorted by position and with its total value — one call renders the whole Kanban board
- **`PATCH /api/v1/deals/:id/move`** handles drag-and-drop: moving a card re-sequences both the destination column (inserting at the dropped position) and the source column (closing the gap it left behind), so ordering never drifts
- **`closedAt` is managed automatically** — set the moment a deal enters Won or Lost, cleared if it's dragged back out
- **Drag-and-drop board** (`@dnd-kit`) with optimistic updates: cards move instantly on drop and only roll back if the server rejects the change, so the board never feels laggy
- Inline-editable deal title and value in the detail drawer (edit, click away, it saves)
- The `CustomerPicker` combobox built for Leads was promoted to `components/shared/` and is now reused by both the Leads and Deals forms
- Sidebar nav and the dashboard's "New deal" quick action now link to a real, working page

### Phase 7 — Reports
- **`GET /api/v1/reports/:type`** (`revenue` | `leads` | `customers` | `performance`), each returning a summary strip + a full data table, filterable by date range (`?from=&to=`) and, for admins/managers, by owner
- **`?format=csv|xlsx|pdf`** on the same endpoint streams a real exported file instead of JSON — CSV built by hand with proper quote-escaping, XLSX via `exceljs` (styled header row, frozen panes, auto-sized columns), PDF via `pdfkit` (branded header, paginated table, page numbers)
- **Restricted to Admin and Sales Manager** — enforced by `requireRole` middleware, matching the sidebar's Reports nav visibility
- Reports page with report-type tabs, a date range filter, summary cards, a read-only data table, and an export menu that downloads the file client-side (via an authenticated blob fetch, since a plain link can't attach the auth header the endpoint requires)

### Phase 8 — Notifications
- **Genuine real-time delivery via Server-Sent Events** (`GET /api/v1/notifications/stream`) — no polling required for new notifications to appear. Since `EventSource` can't send an `Authorization` header, this one route authenticates via a `?token=` query param instead of the standard middleware, verified manually against the same JWT secret
- **`GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, `PATCH /api/v1/notifications/:id/read`, `POST /api/v1/notifications/read-all`**
- **Triggered by real domain events already in the app** — no synthetic demo data: a lead being assigned to someone (`lib/notification-bus.ts` fans the event out to any open SSE connection for that user), a deal being dragged to Won or Lost, or someone else leaving a note on a customer you own
- An in-process pub/sub hub (`notificationBus`) holds open SSE connections per user; `notificationsService.notify()` is the single entrypoint other modules call to both persist a notification and push it live — documented as single-process only, with the swap to Redis pub/sub for multi-instance deployments noted inline
- Bell icon in the topbar with an unread badge, a dropdown panel, mark-one/mark-all-read, and a 60s polling fallback in case the SSE connection ever drops
- **Known scope boundary**: "Task due" and "Meeting reminder" notifications from the original feature list aren't wired up yet, since there's no Task/Meeting CRUD module for them to hook into — they're natural candidates once those modules exist

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
| 9 | AI lead scoring |
| 10 | Deployment (Vercel + Railway) |
