# Frontend — useful commands

All commands are run from `frontend/`.

## Development

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server with HMR on **http://localhost:5173** |
| `npm run preview` | Serve the production build locally for a pre-deploy check |

> The dev server proxies `/api/*` to `http://localhost:3000`, so the backend must be running alongside. Start it with `npm run start:dev` from `backend/`.

## Build

| Command | What it does |
|---|---|
| `npm run build` | Type-check then compile to `dist/` (production bundle) |

## API client

| Command | What it does |
|---|---|
| `npm run api:generate` | Regenerate all types, enums, and React Query hooks from the live backend Swagger spec |

The backend must be running on `http://localhost:3000` before calling `api:generate`.
Generated files land in `src/api/generated/` — never edit them by hand.

Typical re-generation workflow:
```bash
# terminal 1 — from backend/
npm run start:dev

# terminal 2 — from frontend/
npm run api:generate
```

## Minimal local check

```bash
npm install
npm run build
```

For a full stack check (types aligned with the current backend):
```bash
# from backend/
npm run start:dev &

# from frontend/
npm run api:generate
npm run build
```
