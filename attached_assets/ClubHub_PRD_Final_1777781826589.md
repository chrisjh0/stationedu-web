# ClubHub — Product Requirements Document

> **Purpose of this document:** This PRD is intended to be given to a coworker or AI coding assistant to build ClubHub from scratch. It describes every feature, screen, data model, API contract, business rule, tech stack, design system, deployment setup, and code standards required. Build exactly to this spec — do not make independent decisions on areas that are already defined here. This document is fully self-contained; do not reference any previous versions.

---

## 0. Tech Stack

This section is **mandatory**. Do not substitute any part of the stack without explicit approval.

### 0.1 Backend
- **Runtime:** Node.js (LTS)
- **Framework:** Express.js
- **Language:** TypeScript
- **Auth:** Google OAuth 2.0 via `passport-google-oauth20`; sessions managed with JWTs (`jsonwebtoken`)
- **ORM:** Prisma (connects to Supabase)

### 0.2 Database
- **Provider:** Supabase (PostgreSQL under the hood)
- **Access:** Via Prisma ORM on the backend. Never query Supabase directly from the frontend.
- **Schema management:** Prisma migrations (`prisma migrate dev`)

### 0.3 Web Frontend
- **Framework:** React (with Vite as the build tool)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State management:** React Context + `useReducer` (no Redux unless complexity demands it)
- **Routing:** React Router v6
- **HTTP client:** `axios` or native `fetch` with a shared API utility

### 0.4 Mobile App
- **Framework:** React Native (Expo managed workflow)
- **Language:** TypeScript
- **Navigation:** React Navigation v6
- **Styling:** React Native StyleSheet (no Tailwind on mobile)
- **Auth storage:** `expo-secure-store` for JWT

### 0.5 Shared Code
Business logic, TypeScript types/interfaces, and API response shapes must be defined in a shared `/packages/shared` directory and imported by both the web and mobile apps. Do not duplicate type definitions.

### 0.6 Monorepo Structure
Use a monorepo with the following top-level layout:

```
clubhub/
├── packages/
│   ├── shared/          # Shared TypeScript types and utilities
│   ├── backend/         # Express API server
│   ├── web/             # React web app (Vite)
│   └── mobile/          # React Native app (Expo)
├── package.json         # Root workspace config (npm workspaces or Turborepo)
└── .env.example         # Template for all required environment variables
```

---

## 1. Product Overview

ClubHub is a multi-platform school club management application with a **web app** and a **mobile app**. Both platforms are **feature-identical** — a user on mobile and a user on the web see and can do exactly the same things. The two platforms share a single backend (API server) and a single Supabase database.

### Core Problem
Schools have many student clubs but no centralized place to discover them, track meeting schedules, or manage membership. ClubHub solves this by giving students a unified hub to browse clubs, join them, and track events — and giving club leaders tools to manage membership and scheduling.

### Users
- **Students:** Discover clubs, enroll/unenroll, view a shared event calendar, manage their account and notification preferences.
- **Club Leaders:** All of the above, plus create clubs, edit club details, manage the club's leader list, and schedule/delete events.

There is no admin role in this initial build. Leadership is granted per-club through ClubLeader records. An admin role and school-wide admin dashboard are planned for a future version — see Section 15 for details.

---

## 2. Branding & White-Labeling

ClubHub is designed to be sold to individual schools. Each deployment is configured for one school. All UI text referencing the school or app name must use these config values rather than hardcoded strings, so a new school deployment only requires updating the config.

### Per-deployment configuration (environment variables)

| Variable | Description |
|---|---|
| `APP_NAME` | Display name of the app (default: "ClubHub") |
| `SCHOOL_NAME` | Name of the school (e.g., "Lincoln High School") |
| `ALLOWED_EMAIL_DOMAIN` | Restricts login to a single email domain (e.g., `lincoln.edu`). If empty, any Google account is allowed. |
| `SCHOOL_LOGO_URL` | URL or path to the school's logo image |
| `APP_LOGO_URL` | URL or path to the app's logo/icon |
| `SUPPORT_EMAIL` | Contact email shown in the footer/login screen |

---

## 3. Visual Design & Branding

> **Note to implementer:** A reference screenshot showing the desired visual style will be provided separately. Match it closely. The principles below define the design language.

### 3.1 Design Principles
- **Clean and professional.** Prioritize whitespace, readability, and clarity over decoration.
- **Consistent component language.** Cards, modals, buttons, and inputs should all share the same visual style throughout.
- **Accessible.** All text must meet WCAG AA contrast ratios. Interactive elements must have visible focus states.

### 3.2 Color Palette
Use a primary blue as the brand color, with neutral grays for surfaces and text. The exact hex values should be pulled from the reference screenshot. Define all colors as Tailwind CSS custom tokens in `tailwind.config.ts`:

```ts
// tailwind.config.ts (example structure — update hex values from reference screenshot)
colors: {
  primary: {
    DEFAULT: '#175C82',
    light: '#E8F4FA',
    dark: '#0F3D57',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    700: '#374151',
    900: '#111827',
  },
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
}
```

### 3.3 Typography
- **Font:** Inter (Google Fonts). Load via `@fontsource/inter`.
- **Scale:** Use Tailwind's default type scale. Headings use `font-semibold`, body uses `font-normal`.
- **Base size:** 16px.

### 3.4 Spacing & Layout
- Use Tailwind's spacing scale exclusively (4px base unit).
- Cards have `rounded-xl` corners and a subtle `shadow-sm` or `shadow-md`.
- Page content has a max width of `1200px`, centered, with `px-6` horizontal padding.
- Modals are centered with a semi-transparent dark backdrop (`bg-black/40`).

### 3.5 Component Conventions

| Component | Style |
|---|---|
| Primary button | `bg-primary text-white rounded-lg px-4 py-2 font-medium hover:bg-primary-dark` |
| Secondary button | `border border-primary text-primary rounded-lg px-4 py-2 font-medium hover:bg-primary-light` |
| Danger button | `bg-error text-white rounded-lg px-4 py-2 font-medium` |
| Input field | `border border-neutral-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary` |
| Card | `bg-white rounded-xl shadow-sm p-4 border border-neutral-100` |
| Toast | Fixed bottom-right, `rounded-lg shadow-lg`, color-coded by type |
| Club avatar (no photo) | Colored circle with white initial letter. Color must be **consistent across sessions** — derive it deterministically from the club `id` or `name` (e.g., using a hash to pick from a fixed palette of at least 8 colors) rather than randomizing on each load. |

---

## 4. Authentication

### Method
Google OAuth 2.0 (Sign in with Google).

### Flow
1. User visits the app and is redirected to the login screen if not authenticated.
2. User taps/clicks "Sign in with Google."
3. App redirects to Google OAuth consent screen.
4. After Google authenticates the user, the app receives the user's Google profile (name, email).
5. **Domain check:** If `ALLOWED_EMAIL_DOMAIN` is configured, reject any email not ending in `@{ALLOWED_EMAIL_DOMAIN}` and show an error message. The user is not created or logged in.
6. If the email passes validation:
   - If the user exists in the database (matched by email), load their record.
   - If the user does not exist, create a new User record with defaults.
7. Generate a signed **JWT** containing the user's `id` and `email`. Token expiry: **7 days**. Return it to the client.
8. The client stores the JWT:
   - **Web:** `localStorage` (key: `clubhub_token`). Include as `Authorization: Bearer <token>` on every API request.
   - **Mobile:** `expo-secure-store`. Include as `Authorization: Bearer <token>` on every API request.
9. Navigate to the Calendar screen.

### Token Validation
All API routes (except auth routes) must validate the JWT on every request. Invalid or expired tokens must return HTTP 401.

### Logout
The client discards the stored JWT (removes from `localStorage` on web, deletes from `expo-secure-store` on mobile). No server-side denylist is required for the initial build.

### Error Handling — Auth Failures

| Scenario | Behavior |
|---|---|
| Google OAuth callback returns an error | Redirect to `/login?error=oauth_failed`. Display: "Sign-in failed. Please try again." |
| Email domain not allowed | Redirect to `/login?error=domain`. Display: "Only `@{ALLOWED_EMAIL_DOMAIN}` accounts are allowed." |
| JWT expired mid-session | API returns 401 → client clears token → redirect to login with message: "Your session expired. Please sign in again." |
| Google OAuth popup closed by user (mobile) | Dismiss silently, return to login screen with no error. |
| Network unreachable during OAuth | Display: "Unable to connect. Check your internet connection and try again." |

---

## 5. Club Types

Clubs have a `type` field that categorizes them. This enables filtering in the Directory.

### Allowed Club Types
- `Committee`
- `Union`
- `Club`
- `Team`
- `Other`

This is stored as a string enum on the `Club` model. The Directory filter lets users filter by one or more types. See Section 8.6 (Club Directory) for filter behavior and Section 7.4 for the updated API contract.

---

## 6. Data Models

All entities are stored in Supabase (PostgreSQL) managed via Prisma.

### 6.1 User
| Field | Type | Notes |
|---|---|---|
| `id` | Int (autoincrement) | Primary key |
| `email` | String, unique | From Google OAuth |
| `full_name` | String | From Google OAuth on first login; editable by user |
| `graduation_year` | Int? | Optional; parsed from email prefix if available (e.g., "27smith@school.edu" → 2027) |
| `notifications_email` | Boolean | Default: `true` |
| `notifications_reminders` | Boolean | Default: `true` |
| `notifications_new_clubs` | Boolean | Default: `false` |
| `notifications_chat` | Boolean | Default: `true` |
| `notifications_digest` | Boolean | Default: `true` |
| `notifications_push_mobile` | Boolean | Default: `true` |
| `created_at` | DateTime | Default: `now()` |
| `updated_at` | DateTime? | |

**Graduation year parsing rule:** If the email prefix (part before `@`) starts with exactly two digits, interpret them as a year in the 2000s (e.g., `27` → `2027`). If no two-digit prefix is found, set to `null`.

### 6.2 Club
| Field | Type | Notes |
|---|---|---|
| `id` | Int (autoincrement) | Primary key |
| `name` | String, unique | Club name |
| `description` | String | |
| `type` | String | Enum: `Committee`, `Union`, `Club`, `Team`, `Other` |
| `initial` | String (1 char) | First letter of club name, uppercased; auto-derived on create and update |
| `default_day` | String | Day of week for regular meetings (e.g., "Tuesday") |
| `default_location` | String | Regular meeting location |
| `chat_link` | String | External chat/communication URL; may be empty |
| `profile_photo` | String | URL to club photo; may be empty (avatar falls back to `initial`) |
| `creator_user_id` | Int | FK → User; the user who created the club |
| `created_at` | DateTime | |
| `updated_at` | DateTime? | |

**Avatar fallback:** When `profile_photo` is empty, the UI must display the club's `initial` letter on a colored background. The color must be **consistent across sessions** — derive it deterministically from the club `id` or `name` (e.g., using a hash to pick from a fixed palette of at least 8 colors) rather than randomizing on each load.

### 6.3 Event
| Field | Type | Notes |
|---|---|---|
| `id` | Int (autoincrement) | Primary key |
| `club_id` | Int | FK → Club |
| `title` | String | Event name |
| `event_date` | String | Format: `YYYY-MM-DD` |
| `event_time` | String | Format: `HH:MM` (24-hour) |
| `location` | String | |
| `description` | String | Optional; may be empty |
| `created_at` | DateTime | |

### 6.4 Enrollment
| Field | Type | Notes |
|---|---|---|
| `id` | Int (autoincrement) | Primary key |
| `user_id` | Int | FK → User |
| `club_id` | Int | FK → Club |
| `enrolled_at` | DateTime | |

**Constraint:** Unique on `(user_id, club_id)`.

### 6.5 ClubLeader
| Field | Type | Notes |
|---|---|---|
| `id` | Int (autoincrement) | Primary key |
| `club_id` | Int | FK → Club |
| `user_id` | Int? | FK → User; may be null if that person's account doesn't exist yet |
| `name` | String | Display name of the leader |
| `role` | String | Title (e.g., "President", "Vice President") |
| `email` | String | Used as the reliable identity key when `user_id` is null |
| `created_at` | DateTime | |

**Identity resolution rule:** When checking whether a logged-in user is a leader of a club, check by `user_id` first. If no match, check by `email`. If a match is found via email and `user_id` is null, update the record to set `user_id` (self-healing).

---

## 7. API Contract

The backend exposes a REST API consumed by both the web app and the mobile app. All endpoints (except auth routes) require a valid JWT passed as `Authorization: Bearer <token>`. All user-provided string inputs must be sanitized (HTML-escaped) before storage. All responses are JSON.

**Standard success response:** `{ "success": true, ...data }`
**Standard error response:** `{ "success": false, "error": "message" }`

---

### 7.1 Authentication Routes

| Method | Path | Auth required | Description |
|---|---|---|---|
| `GET` | `/login` | No | Login page/screen |
| `GET` | `/auth/google/login` | No | Redirect to Google OAuth |
| `GET` | `/auth/google/callback` | No | Handle Google OAuth callback; create/load user; issue JWT and return it to client |
| `GET` | `/logout` | No | Client discards JWT; redirect to login |

---

### 7.2 Current User API

#### `GET /api/user/me`
Returns the current authenticated user's profile. Called on app launch / after login to populate the navigation bar and any screen that displays the user's name or email. Nothing about the current user should be hardcoded or injected server-side into markup.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "jsmith@school.edu",
    "full_name": "Jane Smith",
    "graduation_year": 2027
  }
}
```

---

### 7.3 Page Routes (Web only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Redirect → `/calendar` (or `/login` if unauthenticated) |
| `GET` | `/calendar` | Calendar page |
| `GET` | `/clubs` | Your Clubs page |
| `GET` | `/leadership` | Leadership Hub page |
| `GET` | `/directory` | Club Directory page |
| `GET` | `/settings` | Settings page |

---

### 7.4 Club API

#### `GET /api/clubs`
Returns all clubs, each annotated with the current user's relationship to that club. Clubs are returned in alphabetical order by name.

**Response:**
```json
{
  "success": true,
  "clubs": [
    {
      "id": 1,
      "name": "Robotics Club",
      "description": "We build robots.",
      "type": "Club",
      "initial": "R",
      "default_day": "Tuesday",
      "default_location": "Room 204",
      "chat_link": "https://...",
      "profile_photo": "",
      "is_enrolled": true,
      "is_leader": false
    }
  ]
}
```

---

#### `GET /api/clubs/leading`
Returns all clubs where the current user is a leader. Uses **email-based lookup** (not just `user_id`) to catch all records reliably.

**Response:**
```json
{
  "success": true,
  "clubs": [
    {
      "id": 1,
      "name": "Robotics Club",
      "description": "...",
      "type": "Club",
      "initial": "R",
      "default_day": "Tuesday",
      "default_location": "Room 204",
      "chat_link": "https://...",
      "profile_photo": "",
      "user_role": "President",
      "member_count": 12,
      "upcoming_events_count": 3
    }
  ]
}
```

---

#### `POST /api/clubs`
Create a new club.

**Request body:**
```json
{
  "name": "Robotics Club",
  "description": "We build robots.",
  "type": "Club",
  "default_day": "Tuesday",
  "default_location": "Room 204",
  "chat_link": "https://...",
  "profile_photo": "",
  "leaders": [
    { "name": "Jane Smith", "role": "President", "email": "jsmith@school.edu" }
  ]
}
```

**Validation:**
- `name` must be non-empty and unique.
- `type` must be one of the valid enum values.
- `leaders` must have at least one entry.
- The creating user's email must appear in the `leaders` list.

**Behavior on success:**
1. Create the Club record. The `initial` field is auto-derived as the first character of `name`, uppercased.
2. Create ClubLeader records for all entries in `leaders`. For the entry matching the current user's email, set `user_id` to the current user's ID.
3. Auto-enroll the creator (create an Enrollment record for the creator).

**Response:** `{ "success": true, "club_id": 1 }`

---

#### `GET /api/clubs/:id`
Returns full details for a single club, including leaders, upcoming events, and the current user's relationship to the club.

**Response:**
```json
{
  "success": true,
  "club": {
    "id": 1,
    "name": "Robotics Club",
    "description": "...",
    "type": "Club",
    "initial": "R",
    "default_day": "Tuesday",
    "default_location": "Room 204",
    "chat_link": "https://...",
    "profile_photo": "",
    "is_enrolled": true,
    "is_leader": false,
    "leaders": [
      { "name": "Jane Smith", "role": "President", "email": "jsmith@school.edu" }
    ],
    "upcoming_events": [
      {
        "id": 5,
        "title": "Weekly Meeting",
        "event_date": "2025-11-12",
        "event_time": "15:30",
        "location": "Room 204",
        "description": ""
      }
    ]
  }
}
```

`upcoming_events` contains only events with a date ≥ today, sorted ascending by date then time.

---

#### `PUT /api/clubs/:id`
Update club details. Requires the current user to be a leader of the club.

**Request body:** Same shape as `POST /api/clubs`.

**Behavior:**
- Update Club record fields. If `name` changes, update `initial` accordingly.
- Replace the club's ClubLeader records with the new `leaders` list.
- **Preserve existing `user_id` values:** Before deleting old leader records, build a map of `email → user_id` and re-apply those values when inserting the new records. This prevents identity loss on edit.

**Response:** `{ "success": true }`

---

#### `DELETE /api/clubs/:id`
Delete a club and all associated data. Requires the current user to be a leader of the club.

**Cascading delete:** Remove all ClubLeader, Enrollment, and Event records associated with this club, then remove the Club record.

**Response:** `{ "success": true }`

---

### 7.5 Event API

#### `GET /api/clubs/:id/events`
Returns **upcoming events only** (date ≥ today) for the given club, sorted ascending by date then time. Used by the Manage Events Modal.

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": 5,
      "title": "Weekly Meeting",
      "event_date": "2025-11-12",
      "event_time": "15:30",
      "location": "Room 204",
      "description": ""
    }
  ]
}
```

---

#### `POST /api/clubs/:id/events`
Create a new event. Requires the current user to be a leader of the club.

**Request body:**
```json
{
  "title": "Weekly Meeting",
  "event_date": "2025-11-12",
  "event_time": "15:30",
  "location": "Room 204",
  "description": ""
}
```

**Validation:** `event_date` must be today or in the future (≥ current date in UTC).

**Response:** `{ "success": true, "event_id": 5 }`

---

#### `DELETE /api/events/:id`
Delete an event. Requires the current user to be a leader of the club that owns this event.

**Response:** `{ "success": true }`

---

### 7.6 Enrollment API

#### `POST /api/clubs/:id/enroll`
Enroll the current user in a club. If the user is already enrolled, return success silently (no error, no duplicate record created).

**Response:** `{ "success": true, "enrollment_id": 10 }`

---

#### `POST /api/clubs/:id/unenroll`
Unenroll the current user from a club.

**Business rule:** If the current user is a leader of this club, reject with HTTP 403:
```json
{ "success": false, "error": "Leaders cannot unenroll from their own club." }
```

**Response:** `{ "success": true }`

---

### 7.7 User Settings API

#### `GET /api/user/settings`
Returns the current user's settings.

**Response:**
```json
{
  "success": true,
  "settings": {
    "full_name": "Jane Smith",
    "email": "jsmith@school.edu",
    "notifications_email": true,
    "notifications_reminders": true,
    "notifications_new_clubs": false,
    "notifications_chat": true,
    "notifications_digest": true,
    "notifications_push_mobile": true
  }
}
```

---

#### `PUT /api/user/settings`
Update the current user's settings. Accepts any subset of the mutable fields.

**Mutable fields:** `full_name`, `notifications_email`, `notifications_reminders`, `notifications_new_clubs`, `notifications_chat`, `notifications_digest`, `notifications_push_mobile`.

**Behavior:** After updating, reload the full user record from the database and return the fresh settings in the response. The client must update any cached user state (e.g., name displayed in the navbar) from this response — no separate re-fetch required.

**Response:**
```json
{
  "success": true,
  "settings": {
    "full_name": "Jane Smith",
    "email": "jsmith@school.edu",
    "notifications_email": true,
    "notifications_reminders": true,
    "notifications_new_clubs": false,
    "notifications_chat": true,
    "notifications_digest": true,
    "notifications_push_mobile": true
  }
}
```

---

### 7.8 Calendar Data API

#### `GET /api/calendar/events`
Returns all events across all clubs, annotated with the current user's enrollment status in each club. Used to power both the daily and monthly calendar views.

**Query params:**
- `year` (integer) — filter to a specific year
- `month` (integer, 1–12) — filter to a specific month

If `year` and `month` are omitted, return events for the **current calendar month** (based on the server's UTC date). Both params must be provided together; providing only one is an error.

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": 5,
      "club_id": 1,
      "club_name": "Robotics Club",
      "title": "Weekly Meeting",
      "event_date": "2025-11-12",
      "event_time": "15:30",
      "location": "Room 204",
      "description": "",
      "is_enrolled": true
    }
  ]
}
```

---

### 7.9 API Error Handling

All API routes must handle the following edge cases explicitly:

| Scenario | HTTP Status | Error message |
|---|---|---|
| Missing or invalid JWT | 401 | `"Unauthorized"` |
| Valid JWT but user not found in DB | 401 | `"User not found"` |
| Resource not found (club, event) | 404 | `"Not found"` |
| Action requires leader, user is not | 403 | `"You must be a leader of this club"` |
| Leader tries to unenroll | 403 | `"Leaders cannot unenroll from their own club."` |
| Duplicate club name | 409 | `"A club with that name already exists"` |
| Invalid `type` value | 400 | `"Invalid club type"` |
| Past event date | 400 | `"Event date must be today or in the future"` |
| Only one of year/month provided | 400 | `"year and month must be provided together"` |
| Database/server error | 500 | `"An unexpected error occurred"` |

**Client-side network errors:** If any API call fails due to a network error (no response received), show a toast: "Network error — check your connection." Never show a blank screen on error; always show either an error state or a toast.

---

## 8. Screens & Features

### 8.1 Login Screen

**Purpose:** Entry point for unauthenticated users.

**Elements:**
- App logo/icon (from `APP_LOGO_URL`)
- App name (from `APP_NAME`)
- School name (from `SCHOOL_NAME`)
- "Sign in with Google" button
- Footer note: if `ALLOWED_EMAIL_DOMAIN` is set, display "Only `@{ALLOWED_EMAIL_DOMAIN}` accounts are allowed."
- Support email link (from `SUPPORT_EMAIL`)

**Behavior:**
- Tapping "Sign in with Google" initiates the OAuth flow.
- If domain check fails after OAuth, display the error message from the URL param.
- If already authenticated, skip this screen and go directly to Calendar.

---

### 8.2 Navigation

A persistent navigation bar (web) or tab bar (mobile) is shown on all authenticated screens.

**Navigation items (in order):**
1. Calendar
2. Your Clubs
3. Leadership
4. Directory
5. Settings

The active item is visually highlighted. Each item navigates to its respective screen.

**Profile area (visible in nav):**
- Shows the user's initials (derived from `full_name`) as an avatar.
- Shows the user's full name and email.
- Contains a "Logout" button.

**Data source:** On app launch (after login), call `GET /api/user/me` to load the current user's name and email. Populate the nav and any other screen that references the user's identity from this response. Nothing about the current user should be hardcoded or injected server-side into markup.

**Live update:** If the user changes their name in Settings, the initials and name in the navigation bar update immediately without a full page/screen reload.

---

### 8.3 Calendar Screen

**Purpose:** View upcoming events across all clubs, in daily or monthly view.

#### Daily View (default)

**Week strip:**
- A horizontal strip showing 7 consecutive days.
- Each day shows: abbreviated day name (Mon, Tue, …) and date number.
- The selected date is highlighted.
- A **red dot** appears under a date if the user is enrolled in any club with an event on that date.
- A **green dot** appears under a date if there are available (non-enrolled) events on that date.
- Navigation arrows allow moving to the previous or next 7-day window.

**Event list for selected date:**
- Shows all events on the selected date, across all clubs.
- **Sort order:** Enrolled-club events appear before non-enrolled events. Within each group, events are sorted by time (earliest first).
- Each event card shows:
  - Event time (12-hour format, e.g., "3:30 PM")
  - Event title
  - Club name
  - Location
  - Description (if present)
- Tapping/clicking an event card opens the Club Detail Modal for that club.
- A header label shows the selected date in a friendly format (e.g., "Monday, November 12").

**Empty state:** "No events on this day."

#### Monthly View (toggled)

- Accessible via a toggle (e.g., "Daily" / "Monthly").
- Displays a full calendar grid for the current month.
- Weekday column headers (Sun–Sat or Mon–Sun).
- Today's date is visually highlighted.
- Selected date is visually highlighted.
- A **red dot** appears on a date if the user is enrolled in any club with an event on that date.
- A **green dot** appears on a date if there are available (non-enrolled) events on that date.
- Both dots may appear on the same date if a user has a mix of enrolled and non-enrolled events.
- Navigation arrows to move to previous/next month.
- Month and year label (e.g., "November 2025").
- Tapping/clicking a date switches to Daily View for that date.

---

### 8.4 Your Clubs Screen

**Purpose:** Quick access to all clubs the user is enrolled in.

**Data source:** Calls `GET /api/clubs` and filters the result client-side to clubs where `is_enrolled: true`.

**Layout:** Grid of club cards.

**Club card shows:**
- Club avatar (profile photo if set, otherwise a colored background with the club's `initial` letter)
- Club name
- Default day and location

**Behavior:**
- Tapping/clicking a card opens the Club Detail Modal.
- Leaders see their own clubs here as well (since they are auto-enrolled on club creation).

**Empty state:** "You haven't joined any clubs yet." with a link/button to the Directory screen.

---

### 8.5 Leadership Hub Screen

**Purpose:** Manage clubs that the current user leads.

**Data source:** Calls `GET /api/clubs/leading` to load the list of clubs the current user leads.

**Header:** "Leadership Hub" + "Create New Club" button.

**Leadership card (one per led club):**
- Club avatar and name
- User's role in that club (e.g., "President")
- Stat: total member count (number of enrolled users)
- Stat: number of upcoming events
- "Edit Details" button → opens Edit Club Modal
- "Delete" button → opens a confirmation dialog. If confirmed, deletes the club and all associated data (cascading delete). Refreshes the screen after deletion.
- "Schedule Event" button → opens Manage Events Modal

**Card body click:** Tapping/clicking anywhere on the card that is not one of the three action buttons opens the Club Detail Modal for that club. This allows leaders to view the club as members see it (description, full leaders list, upcoming events, chat link).

**Empty state:** "You aren't a leader of any clubs yet." with a "Create New Club" button.

---

### 8.6 Club Directory Screen

**Purpose:** Browse and discover all clubs.

**Data source:** Calls `GET /api/clubs` to load all clubs, then applies search and filters client-side.

**Search bar:** Text input at the top. Filters the club list in real-time by club name (case-insensitive substring match).

**Filters (live, applied simultaneously with search):**

*Meeting Day filter:*
- Checkboxes for: Monday, Tuesday, Wednesday, Thursday, Friday
- An "All Days" option that, when selected, shows clubs meeting on any day. If all individual days are checked, "All Days" activates automatically and vice versa.
- Default: All Days selected.

*Enrollment Status filter:*
- Checkboxes for: Enrolled, Not Enrolled
- An "All Clubs" option with the same toggle-all behavior.
- Default: All Clubs selected.

*Club Type filter:*
- Checkboxes for: Committee, Union, Club, Team, Other
- An "All Types" option with the same toggle-all behavior.
- Default: All Types selected.

**Filter logic:** Results must match all active filters simultaneously (AND logic).

**Club list item shows:**
- Club avatar
- Club name
- Description (truncated if long)
- Tags: club type label, meeting day label
- If the user is NOT enrolled: "Join" button. Tapping immediately enrolls the user (no confirmation needed). Button updates to reflect enrolled state.
- If the user IS enrolled: A visual "Enrolled" indicator (not a join button).
- Tapping the club name or avatar opens the Club Detail Modal.

**Empty states:**
- "No clubs found." — when filters/search return nothing from an existing list
- "No clubs available yet." — when there are no clubs in the database at all

---

### 8.7 Settings Screen

**Purpose:** Manage the user's account and notification preferences.

#### Account Information section
- **Full Name field:** Editable text input showing current `full_name`.
- **Email field:** Read-only. Displays current user's email.

#### Notification Preferences section
Six toggle switches, each with a title and description:

| Toggle field | Title | Description | Default |
|---|---|---|---|
| `notifications_email` | Email Notifications | Receive email updates about club events and announcements | ON |
| `notifications_reminders` | Meeting Reminders | Get notified 24 hours before your club meetings | ON |
| `notifications_new_clubs` | New Club Alerts | Be notified when new clubs are created | OFF |
| `notifications_chat` | Chat Messages | Receive chat-platform notifications for club messages | ON |
| `notifications_digest` | Weekly Digest | Receive a weekly summary of upcoming activities | ON |
| `notifications_push_mobile` | Mobile Push Notifications | Receive push notifications on your mobile device | ON |

**Cross-platform note:** All six notification settings are stored per user account — not per device or platform. A user can toggle any setting from either the web app or the mobile app. Changes are reflected on both platforms because they read from the same account record.

#### Save Changes button
- Submits `PUT /api/user/settings` with the current values of all fields.
- On success: show a success toast. Update the app's user state from the response (including updating the navbar avatar/name if `full_name` changed).
- On error: show an error toast.

---

### 8.8 Club Detail Modal

**Trigger:** Tapping/clicking any club card or event card throughout the app. When opened, always fetches `GET /api/clubs/:id` for fresh data — the modal never relies solely on partial data already in memory (e.g., the calendar events response does not include leaders, full description, or chat link).

**Header:**
- Club avatar (photo if `profile_photo` is set, otherwise a colored background with the `initial` letter)
- Club name
- Default day + location

**Body sections (in this order):**

1. **About:** Club description text.
2. **Leaders:** List of leaders, each showing name and role (e.g., "Jane Smith — President").
3. **Upcoming Events:** List of events with date ≥ today, sorted by date then time. Each item shows: formatted date (e.g., "Tue, Nov 12"), time (12-hour format), and location. If there are no upcoming events: "No upcoming events scheduled."
4. **Chat / Communication:** If `chat_link` is non-empty, show a button (e.g., "Open Chat") that opens the link externally.

**Footer action button:**
- If the user **is a leader** of this club: Show a disabled button labeled "You lead this club" (no action, visually greyed out).
- If the user is **enrolled** (and not a leader): Show an "Unenroll" button. On tap: call `POST /api/clubs/:id/unenroll`, then refresh the button state.
- If the user is **not enrolled** (and not a leader): Show an "Enroll" button. On tap: call `POST /api/clubs/:id/enroll`, then refresh the button state.

**Close behavior:** Close button (X) in the corner. On web, also closes when the user clicks the backdrop overlay.

---

### 8.9 Create Club Modal

**Trigger:** "Create New Club" button on the Leadership Hub screen.

**Form sections:**

*Basic Information:*
- Club Name (required, text input)
- Club Type (required, dropdown: Committee / Union / Club / Team / Other)
- Profile Photo URL (optional, URL input)
- Default Meeting Day (required, dropdown/picker: Monday – Friday)
- Default Location (required, text input)
- Description (required, multiline text)
- Chat/Communication Link (optional, URL input)

*Leaders (required):*
- Dynamic list of leader entries. Each entry has: Name (text), Role (text, e.g., "President"), Email (email).
- "Add Leader" button appends a new empty entry.
- Each entry (after the first) has a "Remove" button to delete it.
- At least one leader entry is required at all times.

**Validation (before submit):**
- Club name is non-empty.
- Club type is selected.
- At least one leader entry is present with all fields filled.
- The current user's email appears in the leaders list (frontend check; backend also validates).
- Club name must be unique (backend validates; show error toast if taken).

**Submit behavior:**
- Call `POST /api/clubs` with form data.
- On success: close modal, refresh the Leadership Hub screen, show success toast.
- On error: show error toast with the error message.

---

### 8.10 Edit Club Modal

**Trigger:** "Edit Details" button on a Leadership Hub card.

**Data source:** Calls `GET /api/clubs/:id` when the modal opens to fetch the current club data. Pre-populates all form fields and the leaders list from this response.

**Form:** Same shape as Create Club Modal, pre-populated with the club's existing data and existing leaders list.

**Submit behavior:**
- Call `PUT /api/clubs/:id` with updated form data.
- On success: close modal, refresh the Leadership Hub screen, show success toast.
- On error: show error toast.

---

### 8.11 Manage Events Modal

**Trigger:** "Schedule Event" button on a Leadership Hub card.

**Title:** "Manage Events — [Club Name]"

**Upcoming events list:**
- Shows all future events for this club (date ≥ today).
- Each item shows: date, time, title, location.
- Each item has a "Delete" button. On tap: call `DELETE /api/events/:id`, then refresh the list.
- If no upcoming events: "No upcoming events yet."

**Add New Event form:**
- Title (required, text input)
- Date (required, date picker — only future/today dates selectable)
- Time (required, time picker)
- Location (required, text input)
- Description (optional, multiline text)
- "Add Event" submit button

**Submit behavior:**
- Call `POST /api/clubs/:id/events`.
- On success: refresh the events list, clear the form fields, show success toast.
- On validation error (past date or missing fields): show error toast.

---

## 9. Cross-Cutting Behaviors

### 9.1 Toast Notifications
A lightweight notification system is used throughout the app to give feedback on all async actions.

- **Types:** success, error, info
- **Behavior:** Auto-dismiss after 3 seconds. Multiple toasts can stack.
- **Trigger on success:** club created, club updated, club deleted, event added, event deleted, enrolled, unenrolled, settings saved.
- **Trigger on error:** Any API error — show the error message from the API response.

### 9.2 Loading States
- Show a loading spinner or skeleton state while any data fetch is in progress.
- This prevents showing empty/stale UI before data arrives.

### 9.3 Security
- **JWT authentication:** All API requests (except auth routes) must include a valid `Authorization: Bearer <token>` header. Invalid or missing tokens return HTTP 401.
- **Input sanitization:** All user-provided string data must be HTML-escaped before storage to prevent XSS.
- **Authentication guard:** All screens and API endpoints (except auth routes) require a valid JWT. Unauthenticated requests are redirected to the login screen.

### 9.4 Real-Time UI State Sync
Any action that changes a user's enrollment or club data must immediately update **all visible UI** that references that data — without requiring a full screen reload or navigation away. Specifically:

- **Enrolling or unenrolling** from the Club Detail Modal must immediately update:
  - The modal's footer action button (Enroll ↔ Unenroll)
  - The club card in the Directory (Join button ↔ Enrolled indicator)
  - The club card in Your Clubs (add or remove from list)
  - Any event cards in the Calendar for that club (dot indicators and sort order)
- **Creating a club** must immediately refresh both the Leadership Hub card list and the Your Clubs screen (since the creator is auto-enrolled).
- **Deleting a club** must immediately refresh the Leadership Hub card list and remove the club from Your Clubs if it appears there.
- **Adding or deleting an event** must immediately refresh the Manage Events Modal list.
- **Saving settings** must immediately update the navbar avatar/name if `full_name` was changed.

The implementation strategy (optimistic updates, re-fetch, shared state store, etc.) is left to the implementer. The requirement is that the user should never see stale data after completing an action.

### 9.5 Shared Data Across Platforms
Because both the web app and mobile app use the same backend and database:
- Enrolling in a club on mobile is immediately reflected on the web app.
- Changing notification settings on the web is immediately reflected when opening the mobile app.
- There is no per-device or per-platform divergence in user data.

---

## 10. Business Rules Summary

| Rule | Detail |
|---|---|
| Leader cannot unenroll | `POST /api/clubs/:id/unenroll` returns 403 if the current user is a leader of the club |
| Club names are unique | Backend rejects duplicate names at creation and update |
| Creator must be a leader | The user creating a club must include themselves in the leaders list |
| Creator is auto-enrolled | On club creation, the creator is automatically enrolled so the club appears in "Your Clubs" |
| Future events only | `POST /api/clubs/:id/events` rejects dates strictly in the past |
| Email-based leader lookup | Leadership checks use email as the fallback when `user_id` is null, and self-heal by filling in `user_id` on match |
| Leader `user_id` preserved on edit | When updating a club's leaders list, existing `email → user_id` mappings are preserved |
| User record reloaded after settings save | After `PUT /api/user/settings`, the full user record is reloaded from DB and returned; the client updates all cached user state from this response |
| Domain restriction | If `ALLOWED_EMAIL_DOMAIN` is configured, users with other email domains are rejected at login |
| Cascading delete | Deleting a club removes all associated ClubLeader, Enrollment, and Event records |
| `initial` auto-derivation | The `initial` field on a Club is always the first character of the club name, uppercased. It is set automatically on create and updated automatically if the club name changes. |
| Double-enrollment is a no-op | If a user calls `POST /api/clubs/:id/enroll` and is already enrolled, the backend returns `{ "success": true, "enrollment_id": <existing_id> }` silently (no error, no duplicate record created). |
| Club type is required | Must be one of: Committee, Union, Club, Team, Other. No blank type allowed. |
| Avatar color is deterministic | Club avatar background color is derived from club `id` or `name` via a hash — never random — so it is consistent across sessions and platforms. |

---

## 11. Deployment & Hosting

### 11.1 Hosting Platform
- **Frontend (web):** Vercel. Deploy the `/packages/web` Vite build.
- **Backend:** Vercel Serverless Functions **or** a separate Node.js host (Railway, Render). The backend must be reachable at a stable URL configured as `VITE_API_URL` in the web app and `EXPO_PUBLIC_API_URL` in the mobile app.
- **Database:** Supabase (managed PostgreSQL). Use the Supabase connection string in `DATABASE_URL`.

### 11.2 Environment Variables

All variables must be documented in `.env.example` at the repo root. Never commit `.env` files.

**Backend (`/packages/backend/.env`):**
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
APP_NAME=ClubHub
SCHOOL_NAME=Lincoln High School
ALLOWED_EMAIL_DOMAIN=lincoln.edu
SCHOOL_LOGO_URL=
APP_LOGO_URL=
SUPPORT_EMAIL=support@lincoln.edu
```

**Web (`/packages/web/.env`):**
```
VITE_API_URL=https://your-api-domain.com
```

**Mobile (`/packages/mobile/.env`):**
```
EXPO_PUBLIC_API_URL=https://your-api-domain.com
```

### 11.3 Local Development Setup

**Prerequisites:** Node.js 20+, npm 10+, a Supabase project, Google OAuth credentials.

**Mac Terminal:**
```bash
# 1. Clone the repo and install dependencies
git clone <repo-url>
cd clubhub
npm install

# 2. Copy and fill in environment variables
cp .env.example packages/backend/.env
cp .env.example packages/web/.env
# Edit each .env file with your values

# 3. Run Prisma migrations
cd packages/backend
npx prisma migrate dev
cd ../..

# 4. Start all packages (from root)
npm run dev
```

This starts:
- Backend on `http://localhost:3001`
- Web app on `http://localhost:5173`

**For mobile (separate terminal — Mac Terminal):**
```bash
cd packages/mobile
npx expo start
```

Scan the QR code with the Expo Go app, or press `i` for iOS simulator / `a` for Android emulator.

### 11.4 Vercel Deployment
1. Connect the repo to Vercel.
2. Set the root directory to `packages/web` for the frontend deployment.
3. Add all required environment variables in the Vercel dashboard under Project Settings → Environment Variables.
4. Deploy the backend separately (Railway or Render) and set `VITE_API_URL` to its URL.

---

## 12. Code Style & Conventions

### 12.1 Language & Formatting
- **TypeScript strict mode** enabled in all packages (`"strict": true` in `tsconfig.json`).
- **Prettier** for formatting. Config at repo root (`.prettierrc`):
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "printWidth": 100
  }
  ```
- **ESLint** with `eslint-config-prettier` and `@typescript-eslint/recommended`. Config at repo root.
- Format and lint must pass before any commit (enforced via `lint-staged` + `husky` pre-commit hook).

### 12.2 Naming Conventions
| Thing | Convention | Example |
|---|---|---|
| Files (components) | PascalCase | `ClubCard.tsx` |
| Files (utilities/hooks) | camelCase | `useClubs.ts`, `apiClient.ts` |
| React components | PascalCase | `ClubDetailModal` |
| Functions | camelCase | `fetchClubDetails` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_LEADERS` |
| Types/Interfaces | PascalCase | `ClubResponse`, `UserSettings` |
| Database fields | snake_case (Prisma convention) | `club_id`, `created_at` |
| API routes | kebab-case | `/api/clubs/:id/enroll` |

### 12.3 File Structure (per package)

**Backend:**
```
backend/
├── src/
│   ├── routes/         # Express route handlers (one file per resource)
│   ├── middleware/     # Auth, error handling, validation
│   ├── services/       # Business logic (no DB calls in routes)
│   ├── db/             # Prisma client instance
│   └── index.ts        # App entry point
├── prisma/
│   └── schema.prisma
└── tests/
    └── routes/         # One test file per route file
```

**Web:**
```
web/
└── src/
    ├── components/     # Reusable UI components
    ├── pages/          # One file per route/screen
    ├── hooks/          # Custom React hooks
    ├── context/        # React Context providers
    ├── api/            # API call functions
    └── types/          # Re-exports from shared package
```

### 12.4 Git Conventions
- Branch naming: `feature/`, `fix/`, `chore/` prefixes (e.g., `feature/club-types-filter`)
- Commit messages: imperative mood, present tense (e.g., `Add club type filter to Directory`)
- No direct commits to `main`. All changes via pull requests.

---

## 13. Testing Requirements

Testing is **mandatory**. The following standards must be met before any feature is considered complete.

### 13.1 Backend (Express API)
- **Framework:** Jest + Supertest
- **Requirement:** Every API route must have a corresponding test file in `packages/backend/tests/routes/`.
- **Coverage target:** 90%+ line coverage on all route and service files.
- **What to test per route:**
  - Happy path (valid input, correct response shape)
  - Auth failure (missing/invalid JWT → 401)
  - Validation failure (bad input → 400/409)
  - Not found (non-existent resource → 404)
  - Permission failure where applicable (non-leader → 403)
- **Database:** Use a separate Supabase test project or in-memory mock (e.g., `jest-mock-extended` for Prisma client). Never run tests against the production database.

**Mac Terminal:**
```bash
cd packages/backend
npm test                    # Run all tests
npm test -- --coverage      # Run with coverage report
npm test -- --watch         # Watch mode during development
```

### 13.2 Web Frontend (React)
- **Framework:** Vitest + React Testing Library
- **Requirement:** Test all components that contain business logic or user interactions (modals, forms, filters).
- **Do not test:** Pure presentational components with no logic, third-party library behavior.

**Mac Terminal:**
```bash
cd packages/web
npm test
```

### 13.3 Linting (CI Gate)
Linting must pass on every push. Configure a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs:

```yaml
- npm run lint       # ESLint
- npm run typecheck  # tsc --noEmit
- npm test           # All tests
```

No PR may be merged if any of these fail.

---

## 14. Out of Scope for Initial Build

The following items are explicitly **not** in scope for this version:

- Actual delivery of email, push, or chat notifications (only the preference toggles in Settings are required)
- Rich text or file/image upload for club descriptions (plain text only)
- In-app messaging between students or between leaders and members
- Club application/approval workflows (enrollment is immediate, no approval required)
- Recurring event scheduling (each event is a standalone one-time entry)
- Seed/test data routes or database repair/maintenance utilities

---

## 15. Planned for Future Versions

### 15.1 Admin Role & Dashboard

An admin role and school-wide admin dashboard are planned for a future version of ClubHub. This is **not** in scope for the initial build, but the implementation should be designed with this in mind.

**What is planned:**
- A new `is_admin` boolean field on the `User` model (or a separate `Admin` table) to designate school-wide administrators.
- An `/admin` dashboard route, accessible only to users with admin privileges.
- Admin capabilities will include (at minimum): viewing all clubs and their membership, managing or overriding any club's details, deactivating or deleting any club or user, and viewing school-wide analytics (total clubs, total members, event activity).
- Admins will be distinct from club leaders — admin is a school-level role, not a per-club role.

**Implementation guidance for this build:**
- Do **not** implement the admin role now.
- Do **not** add `is_admin` to the database schema yet.
- Do write the codebase in a way that makes adding a role-based auth layer straightforward in the future (e.g., keep auth middleware modular and avoid hardcoding the two-role assumption deep into business logic).

---

*End of PRD*
