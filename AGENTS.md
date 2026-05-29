# SettleIT — general agent context

Read this file first for a project-wide orientation. Then go to the sub-agent file for the area you are working on:

- [`backend/AGENTS.md`](backend/AGENTS.md) — NestJS API, Prisma schema, modules, seed data
- [`frontend/AGENTS.md`](frontend/AGENTS.md) — Vite + React, orval, generated API client

---

## What this project is

A tool for **medical practitioners** to collect payments faster after patient examinations.

The core loop:
1. A patient examination is registered (`POST /patient-examinations`).
2. This triggers the active **ReminderFlow**, which dispatches notifications (email, SMS…) to the patient.
3. Once the patient pays externally, a practitioner marks the `PaymentRequest` as `FULFILLED`.

**SettleIT does not process payments.** It is a reminder and follow-up orchestration tool. See `backend/AGENTS.md` for the full design constraint.

---

## Monorepo layout

```
SettleIT/
├── AGENTS.md                  ← this file
├── backend/
│   ├── AGENTS.md              ← backend-specific context
│   ├── prisma/schema.prisma   ← single source of truth for the data model
│   ├── src/                   ← NestJS modules
│   └── docs/commands.md
└── frontend/
    ├── AGENTS.md              ← frontend-specific context
    ├── orval.config.ts        ← API client generation config
    ├── src/
    │   ├── api/
    │   │   ├── axios-instance.ts      ← shared axios instance
    │   │   └── generated/             ← orval output (never edit manually)
    │   └── App.tsx
    └── docs/commands.md
```

---

## Current state of advancement

### ✅ Done

**Backend**
- Prisma schema — all models and enums defined (`Patient`, `Examination`, `PatientExamination`, `ReminderFlow`, `FlowNode`, `FlowEdge`, `PaymentRequest`)
- NestJS CRUD modules for every entity with full Swagger documentation (`/api`)
- Global Prisma exception filter (P2025 → 404, P2003 → 400)
- Deterministic seed with three realistic scenarios covering all `PaymentRequestStatus` values
- `outOfPocketCost` computed on demand (never stored)

**Frontend**
- Vite + React 18 + TypeScript scaffolded
- `@tanstack/react-query` v5 wired up in `main.tsx`
- orval configured with `tags-split` mode and React Query client
- Full API client generated from the live Swagger spec — types, enums, hooks, all aligned with the backend

### 🚧 Not yet built

| What | Where it belongs | Notes |
|---|---|---|
| **Flow execution engine** | `backend/src/` | The most critical missing piece. `POST /patient-examinations` has a `TODO` comment marking the exact insertion point. The engine reads `ReminderFlow.isActive`, walks nodes/edges, and creates `PaymentRequest` records. |
| **Frontend UI** | `frontend/src/` | Only a placeholder `App.tsx` exists. No screens, routing, or components yet. |
| **Authentication** | Both | Not started. No auth guard on any endpoint. |
| **Notification dispatch** | `backend/src/` | Email/SMS sending is not implemented. The flow engine will need a notification adapter. |
| **`ReminderFlow.isActive` uniqueness constraint** | `backend/prisma/` | No DB-level or service-level enforcement that only one flow is active at a time. |

---

## Running the full stack

```bash
# Terminal 1 — backend
cd backend
npm run start:dev       # API at http://localhost:3000, Swagger at http://localhost:3000/api

# Terminal 2 — frontend
cd frontend
npm run dev             # UI at http://localhost:5173
```

To regenerate the frontend API client after any backend change:
```bash
# backend must be running
cd frontend && npm run api:generate
```
