# SettleIT — agent context

Documentation updated by Claude Sonnet on 2026-05-29.

Read this file before exploring the codebase. It covers everything needed to navigate, extend, or debug the project without re-deriving context from scratch.

---

## What this project is

A backend for **medical practitioners** to collect payments faster.

The core loop is:
1. A patient examination is registered (`POST /patient-examinations`).
2. This triggers the active **ReminderFlow**, which dispatches notifications (email, SMS…) to the patient.
3. The system checks periodically whether the patient has paid via an **external channel** (bank transfer, front desk, etc.).
4. Once payment is confirmed externally, a practitioner (or an external webhook) marks the corresponding `PaymentRequest` as `FULFILLED`.

---

## ⚠️ What SettleIT is NOT

**SettleIT does not process payments.**

There is no payment gateway, no card tokenization, no transaction ledger. SettleIT's only financial concern is knowing whether a debt has been settled externally. It is a **reminder and follow-up orchestration** tool, not a payment processor.

This distinction must survive every future feature addition:
- Do **not** add payment-processing logic, card fields, or transaction IDs to any model.
- Do **not** name things after payment outcomes ("payment failed", "payment successful"). Name them after **reminder dispatch outcomes** ("delivery failed", "awaiting payment").
- `PaymentRequest` is a **reminder dispatch record** — it records that a reminder was sent via a specific flow node. The word "payment" in the name refers to what the reminder is *about*, not to any payment being executed here.

---

## Stack

- **NestJS 11** — framework
- **Prisma (prisma-client-js)** — ORM, SQLite in dev
- **@nestjs/swagger** — OpenAPI documentation, served at `/api`
- **TypeScript 5**

---

## Monorepo layout

```
SettleIT/
└── backend/
    ├── prisma/
    │   ├── schema.prisma          # single source of truth for the data model
    │   ├── seed.ts                # deterministic seed orchestrator
    │   └── scenario-fixtures.ts   # named business fixture helpers
    ├── src/
    │   ├── main.ts                # bootstrap + SwaggerModule + global exception filter
    │   ├── app.module.ts          # root module, imports all feature modules
    │   ├── prisma/
    │   │   ├── prisma.module.ts
    │   │   ├── prisma.service.ts
    │   │   └── prisma-exception.filter.ts   # maps Prisma errors to HTTP codes
    │   ├── patients/
    │   ├── examinations/
    │   ├── patient-examinations/
    │   ├── reminder-flows/        # also owns flow-nodes and flow-edges
    │   └── payment-requests/
    ├── docs/
    │   └── commands.md            # runnable npm scripts reference
    └── generated/prisma/          # generated Prisma client — never edit
```

Each feature module follows the same layout:

```
<feature>/
  dto/
    create-<feature>.dto.ts   # @ApiProperty decorators, used by Swagger
    update-<feature>.dto.ts   # extends PartialType(Create…Dto)
  <feature>.service.ts        # Prisma calls only
  <feature>.controller.ts     # HTTP layer + @ApiOperation decorators
  <feature>.module.ts
```

---

## Data model (schema.prisma)

```
Patient             id, name, surname, phoneNumber, email, address, coverageRate (Float 0–1)
Examination         id, baseCost (Float, EUR)
PatientExamination  id, patientId, examinationId, date

ReminderFlow        id, name, isActive (Boolean)
FlowNode            id, flowId, type (enum), settings (Json)
FlowEdge            id, sourceNodeId, targetNodeId, conditionType (enum)

PaymentRequest      id, patientExaminationId, flowNodeId, date, status (enum)
```

### Why `Examination` has no name

Medical examination identifiers can constitute sensitive medical data. The `Examination` model intentionally stores only `baseCost`. Practitioners distinguish examinations by their own internal billing codes — SettleIT does not replicate that information.

### Enums (import from `@prisma/client`)

```ts
FlowNodeType          TRIGGER | ACTION | CONDITION | DELAY | END
EdgeConditionType     DEFAULT | TRUE_BRANCH | FALSE_BRANCH
PaymentRequestStatus  PENDING | FULFILLED | DELIVERY_FAILED
```

### `PaymentRequestStatus` — the three states explained

| Status | Meaning | Next step |
|---|---|---|
| `PENDING` | Reminder was successfully dispatched; awaiting external payment confirmation. | Flow engine re-checks after the configured DELAY. |
| `FULFILLED` | Payment was confirmed externally. SettleIT was notified via `PATCH /payment-requests/:id/fulfill`. The reminder cycle is closed. | None — terminal state. |
| `DELIVERY_FAILED` | The notification channel (email/SMS) could not reach the patient (bad address, carrier rejection, etc.). **The patient never received the reminder**, so no payment can be expected from this dispatch. | Human review or alternate contact strategy required. |

`DELIVERY_FAILED` is **not** a payment outcome. It is a **channel delivery** outcome. Never confuse the two.

---

## Key design decisions

**`outOfPocketCost` is never stored.** Computed in both `PatientExaminationsService.findOne()` and `findAll()` as `examination.baseCost * (1 - patient.coverageRate)`. This prevents stale data if insurance rates change.

**`POST /patient-examinations` is the intended flow trigger.** Registering a patient examination is the event that should activate the active reminder flow. The flow execution engine is **not yet implemented** — a `TODO` comment in the controller marks the exact insertion point. Do not claim in Swagger or documentation that the flow fires until the engine exists.

**`ReminderFlow.isActive` selects the flow to run.** Only one flow should have `isActive = true` at a time. The flow engine (when built) must read this flag to know which flow to launch on `POST /patient-examinations`. There is currently no enforcement that only one is active — that constraint should be added when the engine is built.

**`FlowNode.settings` is a freeform JSON blob.** Each node type defines its own config schema inside `settings`. The `conditionType` on `FlowEdge` is only the branch selector; condition parameters live in the upstream `CONDITION` node's `settings`.

**`PrismaModule` is `@Global()`.** `PrismaService` does not need to be imported in individual modules — it is injected directly via the constructor.

**Flow nodes and edges share `ReminderFlowsService`.** `FlowNodesController` and `FlowEdgesController` are separate controllers registered in `ReminderFlowsModule` but delegate entirely to `ReminderFlowsService`.

**`createEdge()` validates cross-flow integrity.** Both `sourceNodeId` and `targetNodeId` must belong to the same flow as the route parameter (`/reminder-flows/:id/edges`). The service throws a `400` if either node is missing or belongs to a different flow.

**Seed data is deterministic and idempotent.** `prisma/scenario-fixtures.ts` uses `faker.seed(42)` plus stable string IDs and Prisma `upsert()` calls.

**"Missing" patient contact fields are empty strings.** `Patient.email` and `Patient.phoneNumber` are required strings, so fixtures for no-email or no-phone patients use `''` rather than `null`.

**Global Prisma exception filter.** `PrismaExceptionFilter` (registered in `main.ts`) translates `P2025` (record not found) → `404` and `P2003` (foreign key failure) → `400`. Services never need to catch Prisma errors manually.

---

## Seed scenarios

The three seed scenarios in `scenario-fixtures.ts` exercise every `PaymentRequestStatus` value and represent realistic reminder dispatch outcomes — **not** payment processing outcomes.

| Function | Status | What it represents |
|---|---|---|
| `createReminderSentAndSettledScenario` | `FULFILLED` | Email reminder dispatched; patient paid externally; practitioner marked it settled. |
| `createReminderSentAwaitingPaymentScenario` | `PENDING` | SMS reminder dispatched and delivered; payment not yet confirmed. |
| `createDeliveryFailedReminderScenario` | `DELIVERY_FAILED` | SMS fallback could not reach patient (bad number). No payment expected from this reminder. |

---

## API surface

### patients

```
POST   /patients
GET    /patients
GET    /patients/:id
PATCH  /patients/:id
DELETE /patients/:id
```

### examinations

```
POST   /examinations
GET    /examinations
GET    /examinations/:id
PATCH  /examinations/:id
DELETE /examinations/:id
```

### patient-examinations

```
POST   /patient-examinations          ← intended flow trigger (engine not yet built)
GET    /patient-examinations          ← includes computed outOfPocketCost on every record
GET    /patient-examinations/:id      ← includes computed outOfPocketCost
PATCH  /patient-examinations/:id
DELETE /patient-examinations/:id
```

### reminder-flows (flows + nested node/edge management)

```
POST   /reminder-flows
GET    /reminder-flows
GET    /reminder-flows/:id            ← includes nodes with their outgoing edges
PATCH  /reminder-flows/:id
DELETE /reminder-flows/:id

POST   /reminder-flows/:id/nodes
GET    /reminder-flows/:id/nodes
POST   /reminder-flows/:id/edges      ← validates both nodes belong to this flow
GET    /reminder-flows/:id/edges

PATCH  /flow-nodes/:nodeId
DELETE /flow-nodes/:nodeId
PATCH  /flow-edges/:edgeId
DELETE /flow-edges/:edgeId
```

### payment-requests

```
GET    /payment-requests?status=PENDING|FULFILLED|DELIVERY_FAILED
GET    /payment-requests/:id
PATCH  /payment-requests/:id/fulfill  ← idempotent; no-op if already FULFILLED
```

Note: there is no `POST /payment-requests`. Payment requests are created by the flow engine when it dispatches a reminder. Creating them manually is only done via the seed.

---

## Common commands

See `docs/commands.md` for the full reference. Short version:

```bash
npm run start:dev      # dev server with watch (Swagger at http://localhost:3000/api)
npm run prisma:migrate # apply DB migrations
npm run prisma:push    # sync local SQLite schema without creating a migration
npm run prisma:seed    # load deterministic business fixtures
npm run prisma:studio  # visual DB browser
npm run build          # compile to dist/
npm run test           # unit tests
```

For local fixture validation:

```bash
npm run prisma:push
npm run prisma:seed
npm run prisma:seed    # idempotence check — must produce no errors
npm run build
npm run test
```

---

## Conventions

- DTOs use `@ApiProperty` / `@ApiPropertyOptional` from `@nestjs/swagger`. `UpdateDto` always extends `PartialType(CreateDto)`.
- Enums in DTOs and controllers are imported from `@prisma/client`.
- When passing `Json` fields (e.g. `FlowNode.settings`) to Prisma, cast via `as unknown as Prisma.FlowNodeUpdateInput` or `as Prisma.InputJsonValue` — `Record<string, unknown>` is not directly assignable to Prisma's Json types.
- Services never catch Prisma errors — the global `PrismaExceptionFilter` handles them.
- Swagger `@ApiOperation` descriptions must be accurate. Do not describe behaviour that is not yet implemented.
