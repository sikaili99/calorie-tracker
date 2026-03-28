# 🥗 Calorie Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2055-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?logo=react)](https://reactnative.dev)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Nx](https://img.shields.io/badge/Nx-Monorepo-143055?logo=nx)](https://nx.dev)

> **Track what you eat. Understand your body.**
> A free, open-source nutrition tracker with AI coaching, photo food logging, and a full-stack monorepo architecture.

---

## 📱 Overview

Calorie Tracker is a cross-platform React Native app (iOS & Android) for tracking daily calories, macros, and meals — powered by a NestJS backend, a Next.js landing page, and shared TypeScript types across the entire stack.

Built as an **Nx monorepo** with:
- **Mobile** — Expo SDK 55 + expo-router, offline-capable with SQLite
- **Backend** — NestJS REST API with Prisma + PostgreSQL (auth & AI stubs ready for wiring)
- **Web** — Next.js 15 landing page with Tailwind CSS
- **Shared types** — Single source of truth for request/response shapes across mobile & backend

---

## ✨ Features

| Feature | Status |
|---|---|
| 📖 **Daily Diary** — log calories, carbs, protein & fat with meal breakdown | ✅ Live |
| 🥗 **Food Database** — USDA + OpenFoodFacts, millions of foods, offline-capable | ✅ Live |
| 📷 **Photo Logging** — AI identifies food from a camera photo | ✅ Live |
| 🤖 **AI Coach** *(Premium)* — conversational nutrition guidance | ✅ Live |
| 📊 **Weekly AI Report** *(Premium)* — auto-generated insights & recommendations | ✅ Live |
| 🏆 **Achievements** — streaks, badges, gamification | ✅ Live |
| 🔍 **Barcode Scanner** — scan packaged foods instantly | ✅ Live |
| 🎯 **Goal Wizard** — TDEE-based calorie & macro targets from onboarding | ✅ Live |
| 💎 **Freemium Paywall** — premium gates with upgrade flow | ✅ Live |
| 🔐 **Auth** — register/login UI + NestJS endpoints | 🔧 Wiring in progress |
| 🌐 **Landing Page** — Next.js marketing site | ✅ Live |

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| **Mobile** | Expo SDK 55, React Native 0.83, expo-router v5, SQLite |
| **Backend** | NestJS 10, Prisma ORM, PostgreSQL |
| **Web** | Next.js 15 (App Router), Tailwind CSS v3 |
| **Shared** | TypeScript strict, `@calorie-tracker/shared-types` |
| **Monorepo** | Nx 20, npm workspaces |
| **AI** | Claude API (stubs ready, real calls in progress) |

---

## 🗂 Monorepo Structure

```
calorie-tracker/
├── apps/
│   ├── mobile/          # Expo React Native app (iOS + Android)
│   ├── backend/         # NestJS REST API + Prisma
│   │   └── prisma/      # schema.prisma — User model ready
│   └── web/             # Next.js 15 landing page
├── libs/
│   └── shared-types/    # @calorie-tracker/shared-types (AI + auth types)
├── nx.json              # Nx workspace config
├── tsconfig.base.json   # Root TS config + path aliases
└── package.json         # npm workspace root
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (for backend, optional for mobile-only dev)

### 1. Clone & Install

```bash
git clone https://github.com/sikaili99/calorie-tracker.git
cd calorie-tracker

# Install all workspace dependencies at once
npm install
```

### 2. Run the Mobile App

```bash
# Start Expo dev server
npm run mobile:start

# Or run directly on a platform
npx nx run mobile:android
npx nx run mobile:ios
```

### 3. Run the Backend

```bash
# Copy and configure environment
cp apps/backend/.env.example apps/backend/.env
# Edit DATABASE_URL in apps/backend/.env

# Run database migrations
cd apps/backend && npx prisma migrate dev --name init

# Start NestJS in watch mode
npm run backend:serve
# → http://localhost:3000
```

### 4. Run the Landing Page

```bash
npm run web:dev
# → http://localhost:3000
```

### 5. Run Everything Together

```bash
npm run dev
# Starts backend + mobile simultaneously via concurrently
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feat/your-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to your branch: `git push origin feat/your-feature`
5. **Open a Pull Request** against `main`

### Code Style

- TypeScript strict mode — no `any`
- Prettier for formatting (config in `.prettierrc`)
- Follow the existing file/folder conventions per workspace

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the full contributor list.

---

## 🗺 Roadmap

- [ ] Wire auth — connect register/login UI to NestJS JWT endpoints (Prisma User model ready)
- [ ] Real AI integration — replace stubs with Claude API calls
- [ ] RevenueCat — replace `updateIsPremium(true)` stub with real billing
- [ ] App Store + Google Play release
- [ ] Push notifications for daily reminders
- [ ] USDA search cache (long invalidation time)
- [ ] Internationalization (i18n)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

This project is built on top of [**Simple Calorie Tracker**](https://github.com/antomanc/simple-calorie-tracker) by [**Antonio Mancini**](https://github.com/antomanc). The original app laid the foundation — the mobile UI, food database integration, and SQLite schema. Huge thanks for the excellent open-source work! 🎉
