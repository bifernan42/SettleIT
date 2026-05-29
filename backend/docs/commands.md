# Backend — useful commands

All commands are run from `backend/`.

## Development

| Command | What it does |
|---|---|
| `npm run start:dev` | Start the server in watch mode (auto-restarts on file change) |
| `npm run start:debug` | Same, with the Node.js debugger attached (port 9229) |
| `npm run start` | Start once, no watch |
| `npm run start:prod` | Run the compiled output in `dist/` |

Swagger UI is available at **http://localhost:3000/api** once the server is running.
The raw OpenAPI JSON spec is at **http://localhost:3000/api-json**.

## Build

| Command | What it does |
|---|---|
| `npm run build` | Compile TypeScript to `dist/` |

## Database

| Command | What it does |
|---|---|
| `npm run prisma:migrate` | Apply pending migrations and update the DB (runs `prisma migrate dev`) |
| `npm run prisma:generate` | Regenerate the Prisma client after schema changes (also runs on `npm install`) |
| `npm run prisma:studio` | Open Prisma Studio — a visual browser for the database |

> `DATABASE_URL` must be set in `.env` before running any database command.

## Tests

| Command | What it does |
|---|---|
| `npm run test` | Run all unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests and generate a coverage report |
| `npm run test:e2e` | Run end-to-end tests |

## Code quality

| Command | What it does |
|---|---|
| `npm run lint` | Lint and auto-fix `src/` and `test/` |
| `npm run format` | Format all TypeScript files with Prettier |
