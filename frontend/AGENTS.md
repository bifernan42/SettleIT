# SettleIT frontend — agent context

Read this file before exploring the frontend codebase. For backend context, see [`backend/AGENTS.md`](../backend/AGENTS.md). For the project overview, see the root [`AGENTS.md`](../AGENTS.md).

---

## Stack

- **Vite 5** — dev server + bundler
- **React 18** + **TypeScript 5**
- **@tanstack/react-query v5** — server state management
- **axios** — HTTP client
- **orval v7** — API client generator (reads the backend OpenAPI spec, outputs TS types + React Query hooks)

---

## File structure

```
frontend/
├── orval.config.ts           ← code generation config (input: backend /api-json)
├── vite.config.ts            ← dev server + proxy (/api → localhost:3000)
├── .env                      ← VITE_API_URL=http://localhost:3000 (safe to commit)
├── src/
│   ├── main.tsx              ← React root, QueryClientProvider
│   ├── App.tsx               ← placeholder — UI not built yet
│   ├── vite-env.d.ts
│   └── api/
│       ├── axios-instance.ts         ← shared axios instance + orval mutator
│       └── generated/                ← NEVER edit — fully managed by orval
│           ├── model/                ← all TypeScript types and enums
│           ├── patients/
│           ├── examinations/
│           ├── patient-examinations/
│           ├── reminder-flows/
│           └── payment-requests/
└── docs/commands.md
```

---

## API client — how it works

The backend exposes its OpenAPI spec at `http://localhost:3000/api-json`. orval reads that spec and generates into `src/api/generated/`:

- **`model/`** — one file per DTO and enum (e.g. `createPatientDto.ts`, `createFlowNodeDtoType.ts`)
- **per-tag files** — one file per Swagger tag, each containing:
  - a plain async function wrapping `customInstance` (e.g. `patientsControllerCreate`)
  - a `useQuery` hook for GET endpoints (e.g. `usePatientsControllerFindAll`)
  - a `useMutation` hook for write endpoints (e.g. `usePatientsControllerCreate`)
  - query key helpers for manual cache invalidation

All hooks route through `src/api/axios-instance.ts` — configure auth headers, interceptors, or base URL there once.

### Re-generating after a backend change

```bash
# backend must be running
cd frontend && npm run api:generate
```

TypeScript will immediately surface any component that relied on a type that changed.

---

## Key conventions

- **Never import from `src/api/generated/`** by writing the path manually inside generated files — they are deleted and recreated on every `api:generate` run.
- Import hooks from the tag file: `import { usePatientsControllerFindAll } from '../api/generated/patients/patients'`.
- If you need a type, import from the model barrel: `import type { CreatePatientDto } from '../api/generated/model'`.
- To customize axios behaviour (auth token, error toast, etc.) edit `src/api/axios-instance.ts` only — never the generated files.

---

## Current state

The frontend is **scaffolded but has no UI yet.** `App.tsx` is a placeholder. The next step is to build screens using the generated hooks. See the root `AGENTS.md` for the full advancement table.
