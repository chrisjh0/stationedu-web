# ClubHub Workspace

## Overview

ClubHub is a full-stack school club management web app. Students can discover clubs, track meetings, manage enrollments, and leaders can manage club events. Built as a pnpm monorepo using TypeScript throughout.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/clubhub) — Wouter routing, TanStack Query, Tailwind CSS, shadcn/ui, framer-motion, sonner toasts
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM (lib/db)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec at lib/api-spec/openapi.yaml)
- **Auth**: JWT (jsonwebtoken) — tokens stored in localStorage as `clubhub_token`
- **Build**: esbuild (CJS bundle for API server)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — rebuild composite libs (run after schema changes)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed demo data into the database

## Architecture

### Packages
- `artifacts/api-server` — Express 5 REST API, serves at `/api/*`
- `artifacts/clubhub` — React + Vite SPA, serves at `/`
- `lib/api-spec` — OpenAPI spec + Orval codegen config
- `lib/api-client-react` — Generated TanStack Query hooks (via Orval)
- `lib/api-zod` — Generated Zod schemas (via Orval)
- `lib/db` — Drizzle ORM schema + db client
- `scripts` — Utility scripts (seed, etc.)

### Database Tables
- `users` — User accounts (created on first OAuth login or dev-login)
- `clubs` — Club definitions (name, type, day, location, etc.)
- `club_leaders` — Leaders per club (name, role, email, optional user_id link)
- `events` — Upcoming club events (club_id, date, time, location)
- `enrollments` — User-club membership (user_id + club_id, unique constraint)

### Auth Flow
- **Dev**: GET `/api/auth/dev-login` → returns JWT token, creates/finds `dev@clubhub.edu` user
- **Production**: GET `/api/auth/google/login` → Google OAuth → GET `/api/auth/google/callback` → redirects to `/?token=<jwt>`
- Token stored in `localStorage` as `clubhub_token`
- `lib/api-client-react/src/custom-fetch.ts` auto-attaches token to all API calls

### Frontend Pages
- `/login` — Auth screen with Google + Dev Login buttons
- `/calendar` — Daily/monthly calendar with event dots and day schedule
- `/clubs` — Grid of enrolled clubs
- `/leadership` — Leadership Hub: manage your clubs, create events
- `/directory` — Explore all clubs with search + filters
- `/settings` — Account settings and notification preferences

### Design System
- Primary color: `#004AC6` (Electric Blue)
- Fonts: Lexend (headings) + Inter (body) from Google Fonts
- Floating pill nav bar (top, glassmorphism), NO sidebar
- Cards: white, rounded-2xl, soft shadow
- Material Symbols Outlined for icons

## Key Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)
- `SESSION_SECRET` — JWT signing secret (fall back to dev default if not set, use for production)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth (optional, dev-login works without)
- `GOOGLE_CALLBACK_URL` — OAuth callback URL (optional, auto-detected from request)
- `NODE_ENV` — Set to `production` to disable dev-login endpoint

## Codegen Note
After editing `lib/api-spec/openapi.yaml`, always run:
```
pnpm --filter @workspace/api-spec run codegen
```
This regenerates `lib/api-client-react/src/generated/api.ts` and `lib/api-zod/src/generated/api.ts`, then rebuilds libs.
