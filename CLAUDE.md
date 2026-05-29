# SettleIT — agent context

Read this file before exploring the codebase. It covers everything needed to navigate, extend, or debug the project without re-deriving context from scratch.

## What this project is

A backend for medical practitioners to collect payments faster. The core idea: when a patient examination is registered, it triggers a configurable **reminder flow** that automatically produces **payment requests** (emails, SMS, etc.) until the debt is settled.

## Stack

- **NestJS 11** — framework
- **Prisma (prisma-client-js)** — ORM, SQLite in dev
- **@nestjs/swagger** — OpenAPI documentation, served at `/api`
- **TypeScript 5**

## Monorepo layout

```
SettleIT/
└── backend/
    ├── prisma/
    │   └── schema.prisma          # single source of truth for the data model
    ├── src/
    │   ├── main.ts                # bootstrap + SwaggerModule setup
    │   ├── app.module.ts          # root module, imports all feature modules
    │   ├── prisma/                # global PrismaModule + PrismaService
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

## Data model (schema.prisma)

```
Patient           id, name, surname, phoneNumber, email, address, coverageRate (Float 0–1)
Examination       id, baseCost (Float, EUR)
PatientExamination  id, patientId, examinationId, date
  → outOfPocketCost is NOT stored; computed on demand as baseCost * (1 - coverageRate)

ReminderFlow      id, name
FlowNode          id, flowId, type (enum), settings (Json)
FlowEdge          id, sourceNodeId, targetNodeId, conditionType (enum)

PaymentRequest    id, patientExaminationId, flowNodeId, date, status (enum)
```

### Enums (import from `@prisma/client`)

```ts
FlowNodeType       TRIGGER | ACTION | CONDITION | DELAY | END
EdgeConditionType  DEFAULT | TRUE_BRANCH | FALSE_BRANCH
PaymentRequestStatus  PENDING | FULFILLED
```

## Key design decisions

**`outOfPocketCost` is never stored.** It is computed in `PatientExaminationsService.findOne()` as `examination.baseCost * (1 - patient.coverageRate)` and appended to the response. This prevents stale data if rates change.

**`POST /patient-examinations` is the flow trigger.** Registering a patient examination is the event that is meant to activate the active reminder flow. The flow execution engine is not yet implemented — `PaymentRequest` records are currently created manually or by future automation.

**`FlowNode.settings` is a freeform JSON blob.** Each node type defines its own config schema inside `settings`. The `conditionType` on `FlowEdge` is only the branch selector; the condition parameters live in the upstream `CONDITION` node's `settings`.

**`PrismaModule` is `@Global()`.** `PrismaService` does not need to be imported in individual modules — it is injected directly in services via the constructor.

**Flow nodes and edges share `ReminderFlowsService`.** `FlowNodesController` and `FlowEdgesController` are separate controllers registered in `ReminderFlowsModule` but delegate entirely to `ReminderFlowsService`.

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
POST   /patient-examinations          ← flow trigger
GET    /patient-examinations
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
POST   /reminder-flows/:id/edges
GET    /reminder-flows/:id/edges

PATCH  /flow-nodes/:nodeId
DELETE /flow-nodes/:nodeId
PATCH  /flow-edges/:edgeId
DELETE /flow-edges/:edgeId
```

### payment-requests
```
GET    /payment-requests?status=PENDING|FULFILLED
GET    /payment-requests/:id
PATCH  /payment-requests/:id/fulfill  ← idempotent status transition
```

## Common commands

See `docs/commands.md` for the full reference. Short version:

```bash
npm run start:dev      # dev server with watch (Swagger at http://localhost:3000/api)
npm run prisma:migrate # apply DB migrations
npm run prisma:studio  # visual DB browser
npm run build          # compile to dist/
npm run test           # unit tests
```

## Conventions

- DTOs use `@ApiProperty` / `@ApiPropertyOptional` from `@nestjs/swagger`. `UpdateDto` always extends `PartialType(CreateDto)`.
- Enums in DTOs and controllers are imported from `@prisma/client`.
- When passing `Json` fields (e.g. `FlowNode.settings`) to Prisma, cast via `as unknown as Prisma.FlowNodeUpdateInput` or `as Prisma.InputJsonValue` — `Record<string, unknown>` is not directly assignable to Prisma's Json types.
- Services never return raw Prisma errors to the controller; error handling to be added when the exception filter layer is built.
