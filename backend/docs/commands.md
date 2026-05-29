# Backend — useful commands

Documentation updated by Codex (GPT-5) on 2026-05-29 19:07:40 CEST.

All commands are run from `backend/`.

## Development

| Command               | What it does                                                  |
| --------------------- | ------------------------------------------------------------- |
| `npm run start:dev`   | Start the server in watch mode (auto-restarts on file change) |
| `npm run start:debug` | Same, with the Node.js debugger attached (port 9229)          |
| `npm run start`       | Start once, no watch                                          |
| `npm run start:prod`  | Run the compiled output in `dist/`                            |

Swagger UI is available at **http://localhost:3000/api** once the server is running.
The raw OpenAPI JSON spec is at **http://localhost:3000/api-json**.

## Build

| Command         | What it does                  |
| --------------- | ----------------------------- |
| `npm run build` | Compile TypeScript to `dist/` |

## Database

| Command                   | What it does                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `npm run prisma:push`     | Sync the local SQLite database with `prisma/schema.prisma` without creating a migration |
| `npm run prisma:migrate`  | Apply pending migrations and update the DB (runs `prisma migrate dev`)                  |
| `npm run prisma:generate` | Regenerate the Prisma client after schema changes (also runs on `npm install`)          |
| `npm run prisma:seed`     | Run deterministic business fixtures via `tsx prisma/seed.ts`                            |
| `npm run prisma:studio`   | Open Prisma Studio — a visual browser for the database                                  |
| `npx prisma db push`      | Direct Prisma equivalent of `npm run prisma:push`                                       |
| `npx prisma db seed`      | Direct Prisma equivalent of `npm run prisma:seed`                                       |

> `DATABASE_URL` must be set in `.env` before running any database command.

### Deterministic fixtures

The seed command is configured in `prisma.config.ts` under `migrations.seed`.
The seed entrypoint is `prisma/seed.ts`; scenario helpers live in `prisma/scenario-fixtures.ts`.
Fixtures use `faker.seed(42)` and stable IDs so the seed can be run repeatedly without duplicating rows.

Seeded scenarios:

| Scenario                           | Purpose                                                                                                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createNoEmailPatient()`           | SMS-only patient path                                                                                                                                                  |
| `createNoPhonePatient()`           | Email-only patient path                                                                                                                                                |
| `createFullContactPatient()`       | Nominal patient path                                                                                                                                                   |
| `createExpensiveExamination()`     | High-cost examination path                                                                                                                                             |
| `createStandardExamination()`      | Nominal examination path                                                                                                                                               |
| `createEmailToSmsFallbackFlow()`   | Email reminder followed by SMS fallback                                                                                                                                |
| `createSmsOnlyFlow()`              | SMS-only reminder flow                                                                                                                                                 |
| `createFulfilledPaymentScenario()` | Completed payment request                                                                                                                                              |
| `createPendingPaymentScenario()`   | Pending payment request                                                                                                                                                |
| `createFailedPaymentScenario()`    | Failed-delivery-style case represented by a pending request on the fallback SMS node, because `PaymentRequestStatus` currently supports only `PENDING` and `FULFILLED` |

Typical local reset/sync for manual testing:

```bash
npm run prisma:push
npm run prisma:seed
```

The seed currently creates 3 patients, 2 examinations, 3 patient examinations, 2 reminder flows, 9 flow nodes, 8 flow edges, and 3 payment requests.

## Tests

| Command              | What it does                             |
| -------------------- | ---------------------------------------- |
| `npm run test`       | Run all unit tests once                  |
| `npm run test:watch` | Run tests in watch mode                  |
| `npm run test:cov`   | Run tests and generate a coverage report |
| `npm run test:e2e`   | Run end-to-end tests                     |

## Code quality

| Command                                                                        | What it does                                                            |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `npm run lint`                                                                 | Lint and auto-fix `src/` and `test/`                                    |
| `npm run format`                                                               | Format TypeScript files in `src/`, `test/`, and `prisma/` with Prettier |
| `npx prettier --write prisma/seed.ts prisma/scenario-fixtures.ts package.json` | Targeted formatting command used when editing seed files                |

## Minimal CI-equivalent local check

There is no repository CI workflow file in this checkout. The minimal backend check that matches the current scripts is:

```bash
npm ci
npm run prisma:generate
npm run build
npm run test
```

When validating fixture changes locally, add the database sync and seed commands:

```bash
npm run prisma:push
npm run prisma:seed
npm run prisma:seed
npm run build
npm run test
```

The second seed run verifies idempotence.

## Dependency management

| Command                              | What it does                                                                |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `npm install -D @faker-js/faker tsx` | Install the deterministic fixture data generator and TypeScript seed runner |
| `npm ci`                             | Install dependencies exactly from `package-lock.json`, suitable for CI      |
