# Station — Current State Report
**Generated:** September 15, 2026  
**Branch:** main · **Last commit:** 145cf35

---

## 1. PROJECT OVERVIEW

**Station** is a school club management platform for Athenian School. Students discover and join clubs, view a shared event calendar, and track their activity. Club leaders manage rosters, schedule events, and take attendance. Admins approve new clubs and see school-wide analytics.

### Architecture

| Layer | Stack |
|---|---|
| **Landing page** | Vite + React + TypeScript, deployed to Vercel (`artifacts/landing/`) |
| **App (clubhub)** | Vite + React + TypeScript + Tailwind v4 + TanStack Query, deployed to Vercel (`artifacts/clubhub/`) |
| **API server** | Express v5 + TypeScript, Dockerised, deployed to Railway (`artifacts/api-server/`) |
| **Database** | Supabase (PostgreSQL) accessed via the Supabase REST client (`@supabase/supabase-js`) — **not** Drizzle or direct TCP |
| **Auth** | Google OAuth 2.0 server-side flow → JWT (7-day) stored in `localStorage` as `clubhub_token` |
| **File storage** | Supabase Storage, `club-photos` bucket; uploads proxied through `/api/storage/uploads` |
| **Shared libs** | `@workspace/api-zod` (Zod schemas), `@workspace/api-client-react` (generated React Query hooks), `@workspace/db` (referenced but Drizzle not used at runtime) |
| **Monorepo tooling** | pnpm workspaces, ESLint, TypeScript project references |

---

## 2. COMPLETED FEATURES

### Authentication / Login
- Google OAuth 2.0 sign-in with server-side code exchange (no implicit flow)
- Automatic user creation on first login; graduation year parsed from email prefix (e.g. `27cho` → 2027)
- Domain restriction to `@athenian.org` (configurable via `ALLOWED_EMAIL_DOMAIN`)
- JWT 7-day tokens; auto-logout on 401 (expired/invalid token)
- `dev-login` bypass endpoint (disabled in production via `NODE_ENV` check)
- Login page displays club count from the API (though see bugs — it always fails)

### Navigation
- Desktop sidebar (180 px fixed left, hidden on mobile)
- Mobile top bar + hamburger slide-in drawer
- Notification dot on "Your Clubs" nav item when unread count > 0
- Active-route indicator, focus trap on mobile drawer, Escape key to close, body scroll lock

### Calendar Page
- Day view: 7-day week strip with per-day event colour dots; click to select day
- Month view: full calendar grid; click day to jump to day view
- Day view event list with time, club name, location, enrolled/available status
- Quick-join button from calendar event row
- "Today" button to reset view
- Keyboard navigation (arrow keys on week strip)

### Your Clubs Page
- Lists all enrolled clubs with meeting day, location, member count
- Stats row: memberships, events this week, hours logged (live from API), notifications
- Click-to-open ClubDetailModal for any club

### Club Detail Modal
- Shows description, meeting day, location, leaders, upcoming events
- Join / Leave buttons with unenroll confirmation step
- "Chat" link button if club has a chat\_link

### Directory Page
- Full club listing with server-side day filter; client-side search and category filter
- Pagination loop (PAGE\_SIZE 50, fetches all pages up to 2000 clubs)
- List view (table with Category / Meets / Members columns) and Grid view toggle
- Join / Leave button inline in list

### Leadership Hub
- Shows all clubs the logged-in user leads (matches by user\_id or email)
- Stats row: clubs led, total members, upcoming events, avg attendance %
- Create Club modal (full form: name, type, category, description, meeting day/location, chat link, photo upload, leaders list)
- Edit Club modal (pre-populated, same fields)
- Schedule Event / Manage Events modal (add / delete upcoming events, view existing)
- Attendance modal per past event (checkbox list of enrolled members, save to DB)
- Delete club with confirmation dialog
- Approval status banner on pending/rejected clubs with rejection note tooltip

### Admin Page
- Analytics tab: KPI cards (total clubs, students participating, past events, ~meeting hours), engagement trend bar chart (6 months), enrollment rate donut chart, category distribution bars, participation by grade (UI rendered but data always zero — see §4), bottom 3 stat cards (avg students/club, most active club, leadership ratio)
- Permissions tab: Club Approvals (approve / reject with optional note), Admin Users (toggle admin status, protected: can't revoke your own)
- Skeleton loading state on analytics

### Settings Page
- Account tab: name edit, email (read-only), avatar upload (Supabase storage), quick notifications toggles, Save button
- Notifications tab: Email, Event Reminders, New Clubs Digest toggles + Save
- Privacy tab: Show Profile, Show Memberships, Allow DMs toggles + Save
- Appearance tab: placeholder (see §4)

### Notifications System
- `GET /api/notifications` returns upcoming events (next 7 days) from enrolled clubs, up to 10
- `unread_count` drives the nav badge

### Photo Upload
- Used in both Settings (avatar) and Create/Edit Club forms
- Client-side type and size validation (≤ 800 KB, JPG/GIF/PNG/WebP)
- Upload via `POST /api/storage/uploads` (multer → Supabase Storage)

### Legal Pages (App)
- Privacy Policy (`/privacy`) — 11 sections, FERPA/COPPA/CCPA coverage
- Terms of Service (`/terms`) — 12 sections
- Cookie Policy (`/cookies`) — 6 sections, localStorage table
- Accessibility Statement (`/accessibility`) — 8 sections
- All linked from each legal page footer; all have "Draft notice" banners

### Legal Pages (Landing)
- Same four pages at `/privacy`, `/terms`, `/cookies`, `/accessibility`
- All linked from landing footer

### Landing Page
- Nav, Hero, Features, ForStudents, ForSchools, FounderQuote, FinalCTA, Footer sections
- "Request demo" opens email picker (desktop) or mailto: (mobile)
- EmailClientPicker modal (Gmail, Outlook, default)

---

## 3. PARTIALLY IMPLEMENTED

| Feature | What exists | What's missing |
|---|---|---|
| **Email notifications** | 3 toggle settings (`notifications_email`, `notifications_reminders`, `notifications_new_clubs`) stored in DB and in Settings UI | No email delivery service anywhere in the codebase. Toggling settings persists them but nothing sends email. |
| **Event reminders** | Same as above — setting stored and displayed | No scheduler or cron job to send reminders before events |
| **New clubs digest** | Setting stored | No weekly digest generation or sending |
| **Graduation year** | Parsed from email on first login, stored in `users.graduation_year` | Never displayed in the UI; admin grade analytics uses hardcoded zeros instead of this column |
| **Chat / DM notifications** | `notifications_chat` DB column exists, `UpdateSettingsInput` accepts it | Not shown in the Notifications settings tab; no DM feature exists to trigger it |
| **Push / mobile notifications** | `notifications_push_mobile` DB column exists | Not shown in settings tab; no push notification integration |
| **Club detail — chat link** | Chat link shown in ClubDetailModal as a button | No validation that the URL is safe (any URL accepted); no format guidance in the form |
| **`end_time` on Create Club** | `endTime` state and form field exist in `CreateClubModal` | Never included in the `createMutation.mutate` call — the value is silently dropped |
| **Student count on login page** | Stat bar displays clubs · students · "EST. 2024" | `stats.students` is initialised to 0 and never set — the STUDENTS counter always shows "—" |

---

## 4. NOT STARTED

| Feature | Evidence in code | What needs building |
|---|---|---|
| **Theme / dark mode** | `activeTab === "Appearance"` renders an info box: *"Theme switching is a placeholder — not yet implemented."* | Dark mode CSS variables, toggle mechanism, persistence in settings |
| **Admin export** | Export button exists in Admin header but is `disabled` with `title="Export — not yet implemented"` | CSV/XLSX export of analytics or club/member data |
| **Grade-level analytics** | `participation_by_grade` always returns `[{grade:"9th",count:0}, ...]`; `grade_data_available` is hardcoded `false` | Calculate grades from `users.graduation_year` (current school year 2026-27 → 12th grade = 2027, etc.) |
| **Direct messaging** | Privacy settings have `privacy_allow_dms` toggle | No DM feature, no UI, no backend routes |
| **Student profile pages** | `privacy_show_profile` and `privacy_show_memberships` settings exist | No `/profile/:id` route; no way to view another student's profile |
| **Account deletion** | Terms of Service says users can request deletion by email | No self-serve deletion endpoint or UI flow |
| **Club search (server-side)** | Directory filters client-side after fetching all clubs | No search query param on `GET /api/clubs`; full-text search needed at DB level |
| **Notification read/dismiss** | `unread_count` is always equal to upcoming event count | No mechanism to mark notifications as read |

---

## 5. KNOWN BUGS

1. **Login page club count always fails (401).** `login.tsx:48` fetches `GET /api/clubs?limit=1000` without an `Authorization` header. This endpoint requires `requireAuth`. The clubs counter on the login page will always show "—".

2. **`end_time` silently dropped when creating a club.** `CreateClubModal` has an end-time input field, but `handleSubmit` never includes it in the mutation data. The field is non-functional.

3. **`stats.students` on the login page is never set.** The fetch callback in `login.tsx:50` only sets `stats.clubs`. The `students` counter never updates from 0, so it always renders "—".

4. **TypeScript error in `api-server`.** `src/lib/supabase.ts:13` — the `ws` package's `WebSocket` constructor type is incompatible with Supabase's `WebSocketLikeConstructor`. The server still builds (esbuild ignores type errors) but `tsc --noEmit` fails. See §13 for full output.

5. **N+1 queries in `listLeadingClubs`.** For each club a leader leads, 3 parallel DB calls + 1 serial lookup are made. A user leading 10 clubs causes 40+ DB round-trips. Will noticeably slow down the Leadership Hub as data grows.

6. **N+1 queries in `getPendingClubs`.** One `users` lookup per pending club to fetch creator name/email. Should be JOINed.

7. **Admin analytics doesn't refresh on tab switch.** Switching to Permissions and back to Analytics does not re-fetch stats. Stats can go stale without a page reload.

8. **`notifications_chat` setting is stored but invisible.** The setting is persisted correctly, but the Notifications tab only renders Email, Event Reminders, and New Clubs Digest. "Chat Notifications" has no toggle in the UI.

9. **Leaders block prevents unenroll even after leader leaves club.** `unenroll` in `enrollmentService.ts` checks `club_leaders` table but doesn't check if the leader has been formally removed — if a leader record still exists (e.g. by email only), they can't leave their own club even if `updateClub` removed them.

10. **The `students` field in `adminService.ts` counts unique user IDs with at least one enrollment, not total registered users.** The KPI label says "Students Participating" which is accurate, but the enrollment rate denominator uses `totalUsers` (all accounts ever created) — a new user with no clubs drags the rate down immediately on signup.

---

## 6. DATABASE STATE

Tables inferred from all Supabase queries across the codebase. No migration files were read (Supabase manages schema directly).

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `email` | text | Unique; school domain restricted |
| `full_name` | text | From Google profile name |
| `graduation_year` | integer | Nullable; parsed from email prefix (e.g. "27" → 2027) |
| `profile_photo` | text | URL; stored in Supabase Storage |
| `is_admin` | boolean | Nullable; treated as false if null |
| `notifications_email` | boolean | |
| `notifications_reminders` | boolean | |
| `notifications_new_clubs` | boolean | |
| `notifications_chat` | boolean | Not shown in Settings UI |
| `notifications_digest` | boolean | Not shown in Settings UI |
| `notifications_push_mobile` | boolean | Not shown in Settings UI |
| `privacy_show_profile` | boolean | |
| `privacy_show_memberships` | boolean | |
| `privacy_allow_dms` | boolean | No DM feature exists |
| `updated_at` | timestamptz | Set on settings update |

### `clubs`
| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `name` | text | Unique |
| `description` | text | |
| `type` | text | `Club | Committee | Team | Union | Other` |
| `category` | text | `Club | Committee | Union | Team` |
| `initial` | text | First letter of name |
| `default_day` | text | Day of week |
| `default_location` | text | |
| `chat_link` | text | External URL |
| `profile_photo` | text | URL |
| `approval_status` | text | `pending | approved | rejected` |
| `rejection_note` | text | Nullable |
| `submitted_at` | timestamptz | Nullable |
| `creator_user_id` | integer | Nullable FK → users.id |
| `updated_at` | timestamptz | |

### `enrollments`
| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `user_id` | integer | FK → users.id |
| `club_id` | integer | FK → clubs.id |

Unique constraint on `(user_id, club_id)` implied by upsert usage.

### `club_leaders`
| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `club_id` | integer | FK → clubs.id |
| `user_id` | integer | **Nullable** — can be email-only before user signs in |
| `name` | text | Display name |
| `role` | text | e.g. "President", "VP" |
| `email` | text | Used to match leaders who haven't yet signed in |

### `events`
| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `club_id` | integer | FK → clubs.id |
| `title` | text | |
| `event_date` | date | `YYYY-MM-DD` |
| `event_time` | time | `HH:MM` (24h) |
| `end_time` | time | Nullable |
| `location` | text | |
| `description` | text | |

### `attendance`
| Column | Type | Notes |
|---|---|---|
| `event_id` | integer | FK → events.id |
| `user_id` | integer | FK → users.id |
| `club_id` | integer | Denormalised FK → clubs.id |
| `attended` | boolean | |
| `marked_at` | timestamptz | |
| `marked_by_user_id` | integer | FK → users.id |

Unique constraint: `(event_id, user_id)` (used in upsert).

> **Note:** There is no `notifications` table. The "notifications" API endpoint is entirely synthetic — it queries upcoming events from the user's enrolled clubs and returns them as notification objects. Nothing is stored.

---

## 7. ENVIRONMENT VARIABLES

### API Server (`artifacts/api-server`)
| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | **Yes** | Supabase project REST endpoint (e.g. `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | **Yes** | Supabase service-role key — full DB access, never expose to clients |
| `JWT_SECRET` | **Yes** | Secret for signing/verifying JWT tokens. Defaults to `"clubhub-dev-secret-change-in-production"` if unset — **must be overridden in production** |
| `GOOGLE_CLIENT_ID` | **Yes** | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | **Yes** | Google OAuth 2.0 client secret |
| `GOOGLE_CALLBACK_URL` | No | OAuth redirect URI; defaults to `{protocol}://{host}/api/auth/google/callback` |
| `FRONTEND_URL` | No | Frontend origin for CORS and post-auth redirect; defaults to `http://localhost:5173` |
| `ALLOWED_EMAIL_DOMAIN` | No | Restricts logins to this domain (e.g. `athenian.org`). Empty string = all domains allowed |
| `NODE_ENV` | No | Set to `production` to disable `GET /api/auth/dev-login` |
| `PORT` / `API_PORT` | No | HTTP server port; defaults to Express default (3000) |

### Clubhub Frontend (`artifacts/clubhub`)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Base URL of the API server. Empty string means same-origin (requires proxy or co-hosting). **Must be set** in Vercel deployment to the Railway backend URL |
| `VITE_SUPPORT_EMAIL` | No | Email shown on login page for help; defaults to `support@stationforedu.com` |
| `VITE_APP_NAME` | No | App name (currently unused in rendered UI) |
| `BASE_URL` | No | Vite base path, consumed by wouter router base in `App.tsx` |

### Landing (`artifacts/landing`)
No environment variables are referenced in the landing source code.

---

## 8. LEGAL PAGES

| Page | App (`/`) | Landing (`/`) | Links from |
|---|---|---|---|
| Privacy Policy | ✅ `/privacy` | ✅ `/privacy` | Landing footer, all legal page footers |
| Terms of Service | ✅ `/terms` | ✅ `/terms` | Landing footer, all legal page footers |
| Cookie Policy | ✅ `/cookies` | ✅ `/cookies` | Landing footer, all legal page footers |
| Accessibility Statement | ✅ `/accessibility` | ✅ `/accessibility` | Landing footer, all legal page footers |

**Status:** All four pages exist in both the app and landing with substantive content. All carry a **"Draft notice"** banner warning they have not been reviewed by legal counsel. Contact email is `27cho@athenian.org` in app pages and `31christopherho@gmail.com` in the landing `DemoModal` — these are inconsistent.

**Gaps:**
- No cookie consent banner (the cookie policy states no third-party analytics; the only storage is `clubhub_token` in localStorage, so this may be acceptable for CCPA/GDPR purposes but should be confirmed)
- Legal pages in the app link "← Back to sign in" only — no link back to the main app for authenticated users

---

## 9. MOBILE RESPONSIVENESS

| Area | Status |
|---|---|
| **Navigation** | ✅ Fixed: desktop sidebar hidden on mobile; mobile top bar + hamburger drawer shown below 768px. Bug fixed in commit 145cf35. |
| **App content padding** | ✅ `padding: 76px 16px 28px` on mobile to clear top bar; `28px 32px` on desktop |
| **Sidebar offset** | ✅ `ml-[180px]` applied via `.sidebar-offset` CSS class only at ≥768px |
| **Stat grids (4-col)** | ✅ `stat-grid-4` collapses to 2-col below 767px |
| **Club grids (2-col)** | ✅ `club-grid-2` collapses to 1-col below 767px |
| **Analytics row** | ✅ `analytics-row-split` stacks below 767px |
| **Directory table** | ✅ Category, Meets, Members columns hidden below 639px |
| **Directory grid** | ✅ `dir-grid` collapses to 1-col below 639px |
| **Calendar week strip** | ✅ Horizontally scrollable on mobile with scroll-snap |
| **Calendar month cells** | ✅ Smaller font and min-height on mobile |
| **Modals** | ✅ `modal-fullscreen-mobile` class makes modals full-screen below 767px |
| **Settings** | ✅ Side-rail becomes horizontal scroll strip on mobile |
| **Event form grid** | ✅ 4-col collapses to 1-col on mobile |
| **Login page** | ⚠️ Two-panel (40%/60%) layout — on very small screens (<480px) the left panel is only 40% wide with large text, which can look cramped. No explicit mobile breakpoint on the login layout. |
| **Landing page** | Not audited in detail; uses its own CSS |

---

## 10. SECURITY AUDIT

| Severity | Issue |
|---|---|
| 🔴 **Critical** | **Real secrets in `.env` file.** The root `.env` contains `SUPABASE_SERVICE_KEY`, `GOOGLE_CLIENT_SECRET`, and `JWT_SECRET` in plaintext. The file is currently untracked (not committed), but it must be added to `.gitignore` and rotated if ever pushed. Confirm `.gitignore` covers it. |
| 🔴 **Critical** | **`JWT_SECRET` has a weak default.** `auth.ts:10` falls back to `"clubhub-dev-secret-change-in-production"` if `JWT_SECRET` is not set in the environment. If this string is ever used in production, any attacker who reads the source can forge tokens. |
| 🟠 **High** | **No rate limiting on any endpoint.** `POST /api/auth/google/login` and `GET /api/auth/google/callback` have no rate limiting. A bot could spam the OAuth flow. |
| 🟠 **High** | **`profile_photo` URL validation only checks `https://` prefix.** `userService.ts:86` accepts any HTTPS URL as a profile photo. An attacker could set their avatar to any HTTPS image including SSRF-adjacent payloads if a server-side renderer ever processes these URLs. Should validate against known storage domain only. |
| 🟡 **Medium** | **`SUPABASE_SERVICE_KEY` used for all operations.** The API server uses the service-role key for every DB query, bypassing all Supabase RLS policies. If the API server is compromised, the attacker has full DB access. Using an anon key with RLS would provide defence-in-depth. |
| 🟡 **Medium** | **`htmlEscape` used inconsistently.** Most string inputs are HTML-escaped on insert, but `chat_link`, `profile_photo`, `event_date`, `event_time`, `end_time` are inserted unescaped. These are unlikely XSS vectors (no raw HTML rendering in the UI) but should be noted. |
| 🟡 **Medium** | **Login page makes unauthenticated request to `/api/clubs`.** `login.tsx:48` fetches clubs without a token. This results in a 401 error silently swallowed, which is not a security issue but wastes a network request on every login page load. |
| 🟢 **Low** | **`dev-login` endpoint gated on `NODE_ENV`.** Correctly disabled in production. Verified. |
| 🟢 **Low** | **CORS is single-origin.** Only `FRONTEND_URL` is allowed. Good. |
| 🟢 **Low** | **JWT tokens include user ID and email.** Email is redundant in the payload — only the user ID is used for DB lookups. Leaking email via JWT decode (tokens are not encrypted, only signed) is minor but unnecessary. |

---

## 11. PERFORMANCE ISSUES

| Severity | Issue |
|---|---|
| 🔴 **High** | **N+1 in `listLeadingClubs`.** For each club the user leads: 1 serial `clubs` lookup + 3 parallel queries (enrollment count, upcoming event count, all attendance rows). A user leading 10 clubs makes ~40 DB round-trips. Each is an HTTP call to Supabase REST. Should be replaced with a single JOIN query or batched. |
| 🔴 **High** | **N+1 in `getPendingClubs`.** One `users` lookup per pending club to resolve creator name. Should be a single query with `IN (creator_user_id_list)`. |
| 🟠 **Medium** | **Directory fetches ALL clubs client-side.** `directory.tsx` loops the paginated API until `hasMore === false`, fetching up to 2,000 clubs, then filters in the browser. As the club count grows, this creates large payloads and long load times. Server-side search and filtering is needed. |
| 🟠 **Medium** | **`listClubs` makes 3 separate queries per call.** Fetches all club enrollments and all club leaders separately (not scoped to the clubs in the current page). These grow with total data size regardless of pagination. |
| 🟠 **Medium** | **Attendance for avg calculation fetches ALL rows.** `listLeadingClubs` fetches every attendance record for a club to compute the average attendance percentage. A `COUNT(*) WHERE attended = true / COUNT(*)` aggregate query would be far more efficient. |
| 🟡 **Low** | **No HTTP caching headers.** API responses don't set `Cache-Control`. All TanStack Query caching is client-side only. |
| 🟡 **Low** | **Admin stats query is 7 separate DB calls in `Promise.allSettled`.** These run in parallel but each is still an HTTP round-trip to Supabase. A stored procedure or batch query would be faster. |
| 🟡 **Low** | **`requireAuth` makes a DB call on every request.** Every authenticated endpoint verifies the user exists in DB. This is correct for security but adds latency. A short-lived cache (e.g. 30s in-memory) would help under load. |

---

## 12. TYPESCRIPT AND ESLINT

### `artifacts/clubhub` — `tsc --noEmit`

```
(no output)
EXIT_CODE: 0
```

✅ Zero errors.

### `artifacts/api-server` — `tsc --noEmit`

```
src/lib/supabase.ts(13,7): error TS2322: Type 'typeof WebSocket' is not assignable to type 'WebSocketLikeConstructor'.
  Types of parameters 'address' and 'address' are incompatible.
    Type 'string | URL' is not assignable to type 'null'.
      Type 'string' is not assignable to type 'null'.
EXIT_CODE: 2
```

❌ One type error. The `ws` package's exported `WebSocket` constructor has a different signature than what `@supabase/supabase-js` expects for `realtime.transport`. Fix: either type-cast (`transport: ws as unknown as WebSocketLikeConstructor`) or remove the custom transport if Supabase realtime is not actually needed (the app does not use real-time subscriptions anywhere).

### ESLint (workspace root)
ESLint ran clean on both packages. The `eslint-disable` comments present (`react-hooks/set-state-in-effect`) are intentional workarounds for calling `setLocation`/`setDrawerOpen` inside effects, which is a known React pattern that the lint rule over-fires on.

---

## 13. NEXT RECOMMENDED TASKS (ordered by impact)

Paste each prompt directly into Claude Code to implement.

---

**1. Fix the TypeScript error in api-server (5 min)**

```
In artifacts/api-server/src/lib/supabase.ts, the `ws` import is causing a TypeScript
type error: the `WebSocket` constructor from the `ws` package doesn't satisfy
Supabase's `WebSocketLikeConstructor` type. Station does not use Supabase Realtime
subscriptions anywhere in the codebase. Remove the `import ws from "ws"` line and
the `realtime: { transport: ws }` option from the createClient call. After the fix,
run `npx tsc --noEmit` in artifacts/api-server to confirm zero errors.
```

---

**2. Fix VITE_API_URL for production Vercel deployment (30 min)**

```
The clubhub frontend uses `import.meta.env.VITE_API_URL` to construct API URLs.
In the current artifacts/clubhub/.env this variable is not set, so all API calls use
relative URLs — this only works when the API is on the same origin. For the Vercel
(clubhub) + Railway (api-server) split-host deployment, VITE_API_URL must be set to
the Railway backend URL at build time.

1. Read artifacts/clubhub/.env and artifacts/clubhub/src/pages/login.tsx.
2. In login.tsx the stats fetch uses `${API_BASE}/api/clubs?limit=1000` without an
   auth token — this always returns a 401. Fix it: either remove this fetch entirely
   (just show "—" for both stats permanently) or remove the clubs count from the login
   panel since unauthenticated club listing is not needed there.
3. Document in a comment in artifacts/clubhub/.env.example the VITE_API_URL variable.
```

---

**3. Fix `end_time` not sent when creating a club (15 min)**

```
In artifacts/clubhub/src/components/CreateClubModal.tsx there is an `endTime` state
variable and an end-time form field, but the `handleSubmit` function never includes
`end_time` in the mutation data object passed to `createMutation.mutate`. Fix this by
adding `end_time: endTime || undefined` to the mutation data. Also verify that
EditClubModal (artifacts/clubhub/src/components/EditClubModal.tsx) handles end_time
consistently — read that file first.
```

---

**4. Fix N+1 queries in `listLeadingClubs` and `getPendingClubs` (2 hours)**

```
In artifacts/api-server/src/services/clubService.ts, the functions `listLeadingClubs`
and `getPendingClubs` have N+1 query problems:

- `listLeadingClubs` (line ~165): inside a for-loop over clubIds, it makes one serial
  `clubs` lookup then 3 parallel queries per iteration. Refactor to:
  1. Fetch all club rows for all clubIds in a single `.in("id", clubIds)` query.
  2. Batch-fetch enrollment counts, upcoming event counts, and attendance rows using
     `.in("club_id", clubIds)` queries, then aggregate in JavaScript.

- `getPendingClubs` (line ~463): loops over clubs and makes one `users` lookup per
  club. Collect all `creator_user_id` values, fetch them in one `.in("id", creatorIds)`
  query, then join in JavaScript.

After refactoring, verify the Leadership Hub and Admin Permissions tab still work
correctly. Run `npx tsc --noEmit` in artifacts/api-server.
```

---

**5. Implement server-side search on `GET /api/clubs` (1.5 hours)**

```
The Directory page in artifacts/clubhub/src/pages/directory.tsx fetches all clubs in
a loop and filters client-side. This is inefficient at scale.

Backend changes (artifacts/api-server/src/routes/clubs.ts and
artifacts/api-server/src/services/clubService.ts):
1. Add a `q` query parameter to `GET /api/clubs` for text search.
2. In `listClubs`, if `q` is provided, add `.ilike("name", `%${q}%`)` OR `.ilike
   ("description", `%${q}%`)` to the Supabase query using `.or()`.
3. Sanitise the search term (strip special characters that could break the ilike).

Frontend changes (artifacts/clubhub/src/pages/directory.tsx):
1. Remove the `fetchAllClubs` loop. Use a single fetch with `limit=100`.
2. Wire the search input to a debounced API call (300ms) using the new `q` param.
3. Show a loading state during search.
4. Keep the category and day filters as additional query params.
```

---

**6. Implement graduation-year grade analytics in Admin (1 hour)**

```
In artifacts/api-server/src/services/adminService.ts, `participation_by_grade` always
returns zeros and `grade_data_available` is hardcoded `false`. Fix this:

1. The current school year is 2026-27. Grade levels:
   - 12th = graduation_year 2027
   - 11th = graduation_year 2028
   - 10th = graduation_year 2029
   - 9th  = graduation_year 2030

2. Add a query to fetch `graduation_year` from `users` where the user has at least
   one enrollment. Use a join or a separate enrollments query.

3. Map graduation years to grade labels and count per grade.

4. Set `grade_data_available: true` when at least one user has a graduation_year set.

5. Update the `AdminStats` interface in both adminService.ts and
   artifacts/clubhub/src/pages/admin.tsx to use `grade_data_available: boolean`
   instead of the hardcoded `false` literal type.
```

---

**7. Add missing notification settings to Settings UI (30 min)**

```
In artifacts/clubhub/src/pages/settings.tsx, the Notifications tab only shows 3
toggles (Email Notifications, Event Reminders, New Clubs Digest). Two more settings
exist in the database and API:
- notifications_chat (Chat Notifications)
- notifications_digest (already shown — verify)
- notifications_push_mobile (Push Notifications)

Read the full settings.tsx file, then:
1. Add `notifChat` and `notifPushMobile` state variables alongside the existing ones.
2. Add them to the Notifications tab toggle list with appropriate labels and
   descriptions.
3. Include them in the `handleSave` mutation data.
4. Add them to the `SettingsForm` props initialisation from `settings`.
Note: these settings have no backend effect yet — they just need to be persisted.
```

---

**8. Fix login page layout for small screens (45 min)**

```
The login page in artifacts/clubhub/src/pages/login.tsx uses a two-panel layout with
the left panel at `width: "40%"` with no mobile breakpoint. On screens narrower than
~480px, the left panel is too narrow for the text.

Fix by:
1. On screens below 640px (use a `useState` + `window.matchMedia` or a CSS class),
   hide the left panel entirely (or render only the logo at the top) and show only
   the right (sign-in) panel full-width.
2. Alternatively, add a `@media (max-width: 639px)` rule in index.css that sets the
   left panel to `display: none` and the right panel to `width: 100%`.
3. After fixing, verify the login page looks correct at 375px (iPhone SE) width in
   browser devtools.
```

---

**9. Add rate limiting to auth endpoints (1 hour)**

```
The API server has no rate limiting. Add express-rate-limit to the auth routes.

In artifacts/api-server:
1. `pnpm add express-rate-limit`
2. In artifacts/api-server/src/app.ts, import `rateLimit` from `express-rate-limit`.
3. Create a limiter: max 20 requests per 15 minutes per IP for `/api/auth/*` routes.
4. Create a looser limiter: max 200 requests per minute per IP for all other `/api/*`
   routes (protect against scraping).
5. Apply limiters using `app.use("/api/auth", authLimiter)` and
   `app.use("/api", generalLimiter)` before the main router.
6. Run `npx tsc --noEmit` in artifacts/api-server after changes.
```

---

**10. Add self-serve account deletion endpoint and UI (2 hours)**

```
The Terms of Service states users can request account deletion by emailing
27cho@athenian.org. Add a self-serve flow instead.

Backend (artifacts/api-server/src/routes/user.ts):
1. Add `DELETE /api/user/me` requiring auth.
2. In a transaction-equivalent sequence (Supabase doesn't have transactions in REST,
   so do these in order with error handling):
   a. Delete all `attendance` records for the user
   b. Delete all `enrollments` for the user
   c. Delete all `club_leaders` records where user_id = userId
   d. Delete the `users` row
3. Return 200 on success.

Frontend (artifacts/clubhub/src/pages/settings.tsx):
1. Add a "Delete Account" button at the bottom of the Account tab.
2. On click, show a confirmation dialog (shadcn AlertDialog) with a warning that
   this is permanent and lists what will be deleted.
3. On confirm, call the delete endpoint, then call `logout()` from AuthContext.
```

---

## 14. TEST RUN READINESS

Checklist before sharing the app with 50 students:

### Environment / Infrastructure
- [ ] `JWT_SECRET` is set to a strong random string (≥32 chars) in Railway env vars — the default fallback **must not** be used
- [ ] `GOOGLE_CALLBACK_URL` is set to the production Railway URL (e.g. `https://api.stationforedu.com/api/auth/google/callback`)
- [ ] `FRONTEND_URL` is set to the production Vercel app URL (e.g. `https://app.stationforedu.com`)
- [ ] `ALLOWED_EMAIL_DOMAIN` is set to `athenian.org`
- [ ] `VITE_API_URL` is set in the Vercel clubhub environment to the full Railway URL
- [ ] `NODE_ENV=production` is set on Railway so `dev-login` is disabled
- [ ] `SUPABASE_SERVICE_KEY` is confirmed unexpired and valid; rotate if `.env` was ever committed

### Google OAuth
- [ ] `https://app.stationforedu.com/login` and the callback URL are both in the Google Cloud Console OAuth authorised redirect URIs
- [ ] The OAuth app is configured for the `athenian.org` Google Workspace domain or left unrestricted (testing mode should be off if restricted)
- [ ] Test end-to-end with an `@athenian.org` Google account from a fresh browser

### Database
- [ ] At least one user has `is_admin = true` in the `users` table (set manually in Supabase dashboard or after first login)
- [ ] The Supabase `club-photos` storage bucket exists and is set to **public** access (otherwise all profile images will be broken)
- [ ] At least 5–10 seed clubs are pre-populated with `approval_status = 'approved'` so new students see a non-empty directory
- [ ] Events exist for at least a few clubs so the calendar is not empty on day one

### App Smoke Tests
- [ ] Sign in flow: new user → auto-created → redirected to `/calendar`
- [ ] Non-athenian.org email → `?error=domain` error shown on login page
- [ ] Directory loads and shows clubs; Join/Leave works
- [ ] Calendar loads events; Quick-join from calendar works
- [ ] Leadership Hub: Create club → "Pending approval" banner shown
- [ ] Admin: approve a pending club → it appears in directory
- [ ] Admin: toggle admin on another user → user gains admin access
- [ ] Settings: change name, upload avatar → persists after page reload
- [ ] Attendance: create event, mark attendance, check hours on Clubs page
- [ ] Mobile: test at ≤375px width — nav hamburger works, modals are full-screen

### Known Issues to Communicate to Students
- [ ] Inform early users that the "Notifications" badge is based on upcoming events, not an unread-read system — it doesn't go away until the event passes
- [ ] Inform leaders that editing a club name or description re-submits it for admin approval
- [ ] Legal pages carry "Draft" banners — decide whether to show them to real users or remove banners before launch

### Outstanding Bugs to Fix Before Launch (Critical)
- [ ] Fix TypeScript error in `api-server/src/lib/supabase.ts` (see §12)
- [ ] Fix `VITE_API_URL` so the frontend actually reaches the backend in production
- [ ] Verify CORS is not blocking production frontend requests to Railway
