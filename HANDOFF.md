# ClubHub — Project Handoff

## Project Structure

```
.
├── artifacts/
│   ├── api-server/          # Express 5 + Drizzle ORM backend
│   │   ├── src/
│   │   │   ├── routes/      # HTTP route handlers (auth, clubs, enrollment, events, notifications, …)
│   │   │   ├── services/    # Business logic (clubService, userService, …)
│   │   │   └── index.ts     # Server entry point — binds PORT, registers routes
│   │   └── tests/           # Vitest test suite (117 tests, 9 suites)
│   └── clubhub/             # React + Vite frontend (SPA)
│       ├── src/
│       │   ├── components/  # Shared UI components (NavBar, Modals, AuthContext, …)
│       │   ├── pages/       # Route-level page components
│       │   └── lib/         # Utilities (color-utils, custom-fetch)
│       └── index.html       # SPA shell with meta tags
├── lib/
│   ├── api-spec/            # OpenAPI 3.0 source of truth (openapi.yaml)
│   ├── api-client-react/    # Orval-generated React Query hooks + Zod schemas
│   └── db/                  # Drizzle ORM schema + migration config
├── scripts/                 # Shared utility scripts
├── .github/workflows/ci.yml # GitHub Actions CI pipeline
├── pnpm-workspace.yaml      # Workspace catalog + package discovery
└── HANDOFF.md               # This file
```

## Environment Variables

### Backend (`artifacts/api-server`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/clubhub` |
| `SESSION_SECRET` | Yes | Secret for JWT signing | `super-secret-32-char-string` |
| `GOOGLE_CLIENT_ID` | Yes | OAuth2 client ID from Google Cloud Console | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth2 client secret | `GOCSPX-...` |
| `GOOGLE_CALLBACK_URL` | Yes | OAuth2 redirect URI | `https://yourdomain.com/api/auth/google/callback` |
| `ALLOWED_EMAIL_DOMAIN` | Yes | Restrict sign-in to this domain | `myschool.edu` |
| `PORT` | No | Server port (default: 8080) | `8080` |
| `NODE_ENV` | No | Environment flag | `production` |

### Frontend (`artifacts/clubhub`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_APP_NAME` | No | App display name (default: ClubHub) | `MySchool Hub` |
| `VITE_SUPPORT_EMAIL` | No | Support contact shown on login page | `it@myschool.edu` |
| `BASE_URL` | Auto | Set by Vite/proxy; do not override | `/` |

### Object Storage

| Variable | Required | Description |
|---|---|---|
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | Yes | Replit object storage bucket ID |
| `PRIVATE_OBJECT_DIR` | Yes | Private upload directory path |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Yes | Public-readable path prefixes |

## Running Locally

```bash
# 1. Install dependencies
pnpm install

# 2. Set environment variables (copy and fill in values)
cp .env.example .env   # create this manually if it doesn't exist

# 3. Push the database schema
pnpm --filter @workspace/db run push

# 4. Start both services (two terminals)
pnpm --filter @workspace/api-server run dev   # API on :8080
pnpm --filter @workspace/clubhub run dev       # Frontend on :22122

# 5. Run codegen after any OpenAPI change
pnpm --filter @workspace/api-spec run codegen

# 6. Typecheck everything
pnpm run typecheck

# 7. Run backend tests
pnpm --filter @workspace/api-server run test
```

## Known Issues & Limitations

- **Google OAuth only**: No email/password login. Requires a configured Google Cloud Console project with OAuth 2.0 credentials and the correct redirect URI.
- **No email notifications**: The notification bell shows upcoming events from enrolled clubs, but no emails or push notifications are sent.
- **Single-tenant**: One ALLOWED_EMAIL_DOMAIN per deployment. Multi-school support would require a tenant system.
- **Photo uploads**: Stored in Replit Object Storage. URLs are signed and expire — not suitable for long-term public links without a CDN.
- **No pagination on Leadership Hub**: All clubs a user leads are loaded at once (unlikely to be a problem but worth noting).
- **Dev-login endpoint**: `GET /api/auth/dev-login` still exists but returns 404 in production (NODE_ENV=production). Should be removed entirely before open-sourcing.

## Next Features (ready to paste into Cursor or Claude Code)

### Mobile App
```
Build a React Native Expo mobile app for ClubHub. It should share the same API
(artifacts/api-server) and use the same generated API client
(lib/api-client-react). Implement: login with Google (expo-auth-session), a
bottom tab navigator with Calendar, Clubs, Directory, and Settings tabs, push
notifications via Expo Notifications for upcoming enrolled events, and offline
caching with AsyncStorage. Match the same color palette (primary blue gradient,
surface-container backgrounds). Use NativeWind for styling.
```

### Playwright E2E Tests
```
Add Playwright end-to-end tests to the ClubHub project. Create a
tests/e2e/ directory at the repo root. Write tests for: login redirect
(unauthenticated user lands on /login), directory page loads clubs, enrolling in
a club updates the Your Clubs page, calendar shows enrolled events, creating a
club via the Leadership Hub form. Use a test user seeded via a /api/auth/dev-login
endpoint (gated to NODE_ENV=test). Run the tests in CI via .github/workflows/ci.yml.
```

### Vercel Deployment
```
Configure ClubHub for deployment on Vercel. The frontend (artifacts/clubhub)
should deploy as a Vite static site. The backend (artifacts/api-server) should
deploy as a Vercel Serverless Function. Add a vercel.json at the repo root that
routes /api/* to the serverless function and everything else to the static frontend.
Update GOOGLE_CALLBACK_URL and CORS origins to use the Vercel production domain.
```

### Google OAuth Setup Guide
```
Write a GOOGLE_OAUTH_SETUP.md guide explaining step-by-step how to create a
Google Cloud Console project, enable the Google+ API, create OAuth 2.0 credentials,
set the authorized redirect URI to https://yourdomain.com/api/auth/google/callback,
and add the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the environment. Include
screenshots descriptions for each step and common errors (redirect_uri_mismatch, etc.).
```

### White-Label Config UI
```
Add an admin settings page at /admin (only visible to users with role="admin" in
the DB) that lets the school IT admin configure: APP_NAME, SCHOOL_NAME,
SUPPORT_EMAIL, ALLOWED_EMAIL_DOMAIN, primary color, and logo upload. Persist these
to a new school_config table in the DB. Have the frontend fetch this config on
startup and override CSS variables and meta tags accordingly. This makes the app
fully white-label without redeployment.
```
