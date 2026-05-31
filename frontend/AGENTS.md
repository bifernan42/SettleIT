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

The flow editor is **production-ready**. All major UX gaps from the first agent have been addressed.

### Flow editor — what was added (2026-05-31)

**Files modified:**
- `src/pages/flows/hooks/useFlowEditor.ts` — added `FlowEditorContext` (React context carrying `deleteNode` + `deleteEdge`); added `deleteNode()` and `deleteEdge()` mutations; `onConnect` now reads `connection.sourceHandle` to set `TRUE_BRANCH`/`FALSE_BRANCH` on edges from CONDITION nodes; `toRFEdge` sets `sourceHandle` and `type: 'conditionEdge'` so edges restore correctly on reload.
- `src/pages/flows/nodes/DomainNode.tsx` — full rewrite: emoji + human-readable label per node type and sub-type (e.g. "📧 Envoi Email", "⏳ Attendre 7 jours"); hover delete button (`×`); no incoming handle on TRIGGER, no outgoing handle on END; CONDITION nodes have two colored source handles with labels (✓ Oui green / ✗ Non red).
- `src/pages/flows/panels/NodeSettingsPanel.tsx` — full rewrite: type-specific React forms (no more raw JSON textarea); TRIGGER/END show informational panels; DELAY has a number input; ACTION has canal selector + message textarea; CONDITION has category + contextual field/check selector; delete button in panel footer.
- `src/pages/flows/panels/AddNodeToolbar.tsx` — emoji labels + tooltip titles per node type.
- `src/pages/flows/nodes/nodeTypes.ts` — exports `edgeTypes` (new) alongside `nodeTypes`.
- `src/pages/flows/FlowEditorPage.tsx` — wraps canvas in `FlowEditorContext.Provider`; passes `edgeTypes` to `<ReactFlow>`; passes `deleteNode` to `NodeSettingsPanel`.

**New file:**
- `src/pages/flows/edges/ConditionEdge.tsx` — custom React Flow edge; colored stroke (green/red/gray) per `conditionType`; label chip (✓ Oui / ✗ Non); inline delete button.

**Settings schema per node type:**
| Type | Settings |
|------|----------|
| TRIGGER | `{}` |
| END | `{}` |
| DELAY | `{ delayDays: number }` |
| ACTION | `{ actionType: 'EMAIL'\|'SMS'\|'WHATSAPP'\|'COURRIER', messageContent: string }` |
| CONDITION | `{ conditionCategory: 'DATA_AVAILABLE'\|'ACTION_RESULT', field?: string, check?: string }` |
