# Jaabili V1 UI

Vite/React frontend for the Jaabili V1 application (pnpm workspace, main app
lives in `apps/main-ui`).

## Setup

```powershell
pnpm install
pnpm --filter ./apps/main-ui run dev
```

The app defaults to `PORT=3000` and `BASE_PATH=/`. Copy `.env.example` (and
`apps/main-ui/.env.example`) to `.env` and fill in `VITE_API_BASE_URL` and
`VITE_GOOGLE_CLIENT_ID`. Authentication is Google Sign-In + email/password
against the API — Firebase is not used.

## Vercel

- Framework preset: Vite
- Build command: `pnpm run build`
- Output directory: `dist`
