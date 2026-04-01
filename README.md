# Calorie Tracker

Calorie Tracker is an Nx monorepo for a nutrition app:
- `apps/mobile`: Expo + React Native app (iOS/Android)
- `apps/backend`: NestJS API + Prisma + PostgreSQL
- `apps/web`: Next.js landing page
- `libs/shared-types`: shared request/response and domain types

This repo is actively evolving. The goal is to keep local development simple and make it easy for contributors to work across mobile and backend without duplicating contracts.

## Tech Stack

- Mobile: Expo SDK 55, React Native 0.83, expo-router, SQLite
- Backend: NestJS 11, Prisma, PostgreSQL
- Web: Next.js 15
- Monorepo: Nx + npm workspaces
- Language: TypeScript (strict)

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (required for backend)

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/sikaili99/calorie-tracker.git
cd calorie-tracker
npm install
```

### 2. Configure environment

Create backend env:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Required backend values in `apps/backend/.env`:
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`

Mobile public env values are documented in root [`.env.example`](./.env.example):
- `EXPO_PUBLIC_BACKEND_URL`
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

### 3. Run database migration

```bash
cd apps/backend
npx prisma migrate dev --name init
cd ../..
```

### 4. Start services

Backend:

```bash
npm run backend:serve
```

Mobile:

```bash
npm run mobile:start
```

Optional web app:

```bash
npm run web:dev
```

## Daily Commands

From repo root:

```bash
npm run mobile:start
npm run mobile:android
npm run mobile:ios

npm run backend:serve
npm run backend:build

npm run web:dev
npm run web:build
npm run web:start

npm run dev
```

`npm run dev` starts backend + mobile together.

## Auth and Google Sign-In Notes

- Backend validates Google ID tokens against `GOOGLE_CLIENT_ID`.
- Mobile `EXPO_PUBLIC_GOOGLE_CLIENT_ID` should match backend `GOOGLE_CLIENT_ID` (web OAuth client).
- On a physical device, do not use `http://localhost:3000` for `EXPO_PUBLIC_BACKEND_URL`; use your machine LAN IP instead (for example `http://192.168.1.20:3000`).

## Project Layout

```text
calorie-tracker/
├── apps/
│   ├── mobile/
│   ├── backend/
│   │   └── prisma/
│   └── web/
├── libs/
│   └── shared-types/
├── nx.json
├── tsconfig.base.json
└── package.json
```

## Contributing

1. Create a branch from `main`.
2. Keep changes scoped (mobile, backend, or web), and reuse `libs/shared-types` for cross-app contracts.
3. Run relevant checks before opening a PR.

Suggested checks:

```bash
npx tsc --noEmit -p apps/mobile/tsconfig.json
npx tsc --noEmit -p apps/backend/tsconfig.json
cd apps/backend && npm run build
```

## License

MIT — see [LICENSE](./LICENSE).

## Acknowledgements

This project builds on top of [Simple Calorie Tracker](https://github.com/antomanc/simple-calorie-tracker) by [Antonio Mancini](https://github.com/antomanc).
