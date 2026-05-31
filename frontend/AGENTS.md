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

### UI/UX Overhaul — produit vs CRUD (2026-05-31)

**Nouvelles pages créées :**
- `src/pages/home/HomePage.tsx` — Dashboard : stats (visites, relances PENDING/FULFILLED/FAILED), widget workflow actif, 4 quick-action cards.
- `src/pages/campagne/CampagnePage.tsx` — Sélection workflow + checklist patients → toast de confirmation (campagne simulée, flow engine non construit).
- `src/pages/settings/ReglagesPage.tsx` — Examens CRUD déplacé ici, présenté en layout settings propre.

**Navigation restructurée (`AppShell.tsx`) :**
- Sidebar avec icon emoji + label français pour chaque entrée.
- Nav principale : Accueil / Visites / Patients / Relances / Campagne.
- Nav bas : Workflows / Réglages.

**Routes (`App.tsx`) :**
- `/` → HomePage, `/visites` (was `/patient-examinations`), `/relances` (was `/payment-requests`), `/campagne` (nouveau), `/reglages` (nouveau).
- Redirects 301 pour les anciennes URLs.

**Traduction française complète :**
- Tous les libellés, titres de page, boutons, colonnes de table, confirmations de suppression.
- `ConfirmDialog.tsx` — defaults en français ("Confirmer la suppression" / "Annuler" / "Supprimer").
- `StatusBadge.tsx` — "⏳ En attente", "✅ Réglé", "❌ Échec d'envoi".
- `columns.tsx` de chaque page — headers et actions traduits.

**Toast via `sonner` :** installé + `<Toaster>` dans `main.tsx`. Utilisé sur la page Campagne.

---

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

---

### Business rules, eligibility & analytics (2026-05-31)

**New page — `src/pages/analytics/AnalyticsPage.tsx`** (route `/analytics`, nav entry 📊 Analytics in `AppShell.tsx`). Uses **Recharts** (installed): donut of relances par statut, bar chart € dus vs recouvrés, bar chart visites par mois (12 derniers mois). Colors from `--chart-1..--chart-5` CSS tokens.

**Settings — `src/pages/settings/PolicyRules.tsx`** (rendered atop `ReglagesPage`): two range sliders bound to `GET/PATCH /settings/policy` — "Délai minimum entre deux relances" (1–30 j) and "Âge maximum d'une visite relançable" (1–5 ans, stored as days ×365). Auto-saves on slider release (`onValueCommit`), no save button. New `src/components/ui/slider.tsx` is a styled native `<input type="range">` (controlled, `onValueChange`/`onValueCommit`).

**Home — `src/pages/home/HomePage.tsx`** gained a "Reste à charge" section: € en attente (sum of PENDING `baseCost*(1-coverageRate)`) and € recouvré (sum of FULFILLED), formatted via `toLocaleString('fr-FR', {style:'currency',currency:'EUR'})`.

**Campagne — `src/pages/campagne/CampagnePage.tsx`** now consumes `GET /campaigns/eligibility` instead of the raw patients list: only eligible patients are selectable (each shows its € due), and a read-only "Patients non contactables" section lists excluded patients with their reason (🚫 Visite trop ancienne / Contacté récemment). Launch is still a `sonner` toast.

Run `npm run api:generate` (backend up) after pulling — adds `useSettingsController*` and `useCampaignsControllerEligibility` hooks.

**Analytics — business metrics & colors (2026-05-31).** The `--chart-1..--chart-5` tokens in `index.css` were grayscale (chroma 0); they now hold a vivid palette (blue/green/amber/red/purple) used app-wide. `AnalyticsPage.tsx` consumes `GET /analytics/summary` (`useAnalyticsControllerSummary`) and adds: 4 KPI cards (recouvré, dû, taux de règlement, canal le plus efficace), a "workflow le plus rentable" highlight, a horizontal bar of € recouvré vs dû per workflow, a bar of efficacité (%) per canal, the status donut, visites/mois, and a per-channel detail table. Charts use explicit oklch color strings (Recharts `fill` takes literal colors, not CSS-var references). Re-run `npm run api:generate` to get the analytics hook.
