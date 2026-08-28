# Station Redesign Report — Direction B "Console"

## COMPLETED

### Part 1 — Design Tokens
- `index.html`: Updated Google Fonts links to Schibsted Grotesk (display), Hanken Grotesk (body), JetBrains Mono (mono).
- `src/index.css`: Complete rewrite. `:root` defines all Station design tokens (`--primary: #232E54`, `--accent: #DD5E54`, font stacks, 6-level radius scale, shadow scale, 7 category colors). Mapped to Tailwind v4 `@theme inline`. Backward-compat HSL vars preserved for existing shadcn/ui components.
- `src/lib/color-utils.ts`: Replaced 13-color palette with 7 Station category colors cycling via `id % 7`. Exports `getClubColor(id)`.

### Part 2 — Fixed Left Sidebar
- `src/components/NavBar.tsx`: Rewrote as fixed 180px-wide left sidebar (navy background). Includes Station SVG logo mark (two overlapping circles + coral dot), "ATHENIAN SCHOOL" mono overline, nav links with coral active left-bar indicator, badge counts, user footer with avatar initial + name + email. Admin link conditionally shown when `user.is_admin === true`.
- `src/App.tsx`: Added sidebar layout with `margin-left: 180px` CSS media query offset on main content. Added `AdminGuard` component (redirects non-admins to /calendar). Added `/admin` route.

### Part 3 — Login Page
- `src/pages/login.tsx`: Split layout — 40% navy left panel (Station SVG logo, tagline, sub-copy, live club-count stat from `/api/clubs`), 60% white right panel (SIGN IN overline, "Welcome back" heading, coral Google sign-in button, domain restriction note). Graceful fallback if API stats fail.

### Part 4 — Calendar Page
- `src/pages/calendar.tsx`: Redesigned with week strip (7-column grid, category color pip bars, navy selected state), Day/Month toggle, event rows with left color rail and time column, month grid with coral today border. Quick-join from event rows via `useEnrollInClub`.

### Part 5 — Your Clubs Page
- `src/pages/clubs.tsx`: Stats row (4 cards: Memberships, Events This Week, Hours Logged placeholder, Notifications), 2-column card grid with left-rail color border, LEADER badge or type badge, meta row. "Find clubs" button links to directory.

### Part 6 — Directory Page
- `src/pages/directory.tsx`: Search input, list/grid view toggle, type filter pills (All/Club/Team/Committee/Union), "SHOWING X OF Y" count. Default list view as table with columns (Club, Category, Meets, Members, Action). Grid view as 2-column card grid. Enroll/unenroll with immediate optimistic state update. Paginated fetch (50 per page until `hasMore` is false) to load all clubs.

### Part 7 — Modals
- `src/components/ClubDetailModal.tsx`: Redesigned with Station modal style — colored avatar, type badge, club name, description paragraph, MEETS/LOCATION/LED BY detail rows (with icons), upcoming events mini-list. Footer: coral "+ Join club" button (or "Leave club" + confirm-unenroll flow, or "You lead this club" disabled). Chat button shown beside action button when `chat_link` is set.
- `src/components/ManageEventsModal.tsx`: Redesigned with club header (avatar + overline + "Schedule an event" heading), 3-column form (Date/Time/Location) below Event Title, coral "+ Add event" submit button, upcoming events list with count badge and delete button per row.

### Part 8 — Leadership Hub
- `src/pages/leadership.tsx`: Stats row (Clubs Led, Total Members, Upcoming Events, Avg. Attendance placeholder), 2-column card grid with Edit/Schedule event/Delete footer actions. Delete confirmation dialog. "+ Create club" button flows to `CreateClubModal` then `ManageEventsModal`.

### Part 9 — Settings Page
- `src/pages/settings.tsx`: Left subnav rail (200px, 4 tabs) + right content panel. Account tab: avatar initial, Full Name field, Email field (disabled), Quick notifications toggles. Notifications tab: 3 toggle rows. Privacy tab: 3 toggle rows. Appearance tab: placeholder info box. Custom `Toggle` component.

### Part 10 — Admin Page
- `src/pages/admin.tsx`: New page at `/admin`, gated by `user.is_admin`. Analytics tab: 4 KPI stat cards (Total Clubs real, others placeholder), bar chart (placeholder), donut chart (0% placeholder), category distribution from club types with progress bars, participation by grade (placeholder), 3 bottom stat cards (Avg Students/Club real, Most Active Club real, Leadership Ratio placeholder). Permissions tab: placeholder card.

### Part 11 — Backend
- `src/services/userService.ts`: Added `is_admin` to `UserProfile` interface and `getMe()` return value.
- `src/components/AuthContext.tsx`: Added `is_admin?: boolean` to local `UserProfile` interface.
- `artifacts/api-server/src/middlewares/auth.ts`: Removed debug `console.log` statements (ESLint fix).
- `artifacts/api-server/src/routes/auth.ts`: Removed debug `console.log` statement (ESLint fix).

---

## PLACEHOLDERS (Intentional — No Backend Data Available)

| Location | Placeholder | Reason |
|---|---|---|
| Leadership Hub stats | Avg. Attendance = 0% | No attendance tracking API |
| Your Clubs stats | Hours Logged = 0 | No hours tracking API |
| Admin KPIs | Students Participating, Past Events, Engagement Trend, Enrollment Rate | No admin analytics endpoint |
| Admin charts | All bar chart bars = placeholder heights | Same as above |
| Admin donut chart | 0% enrolled | No server-side enrollment rate endpoint |
| Admin grade participation | All zeros | No grade-level data |
| Admin Leadership Ratio | — placeholder | Computed from zero-denominator |
| Admin Permissions tab | "Coming soon" pill | No permissions management API |
| Login stats | Falls back to "—" on API failure | Login page fetches clubs unauthenticated |

---

## NOT STARTED / OUT OF SCOPE

- Mobile hamburger menu for sidebar (design shows desktop only; NavBar has a `TODO` comment for this)
- Dark mode toggle (Appearance tab in Settings has a placeholder info box noting this)
- Attendance tracking features
- Hours logging features
- Admin permissions management UI

---

## BUGS FIXED

1. **ESLint: no-console** — Removed `console.log` debug statements from `auth.ts` middleware and `routes/auth.ts`. Added `eslint-disable-next-line` to the intentional dev-only log in `main.tsx`.
2. **ESLint: @typescript-eslint/no-unused-vars** — Removed unused `useEffect` and `getGetClubsQueryKey` imports from `admin.tsx`; removed unused `getGetClubsQueryKey` and `format` from `clubs.tsx`.
3. **ESLint: react-hooks/exhaustive-deps** — Wrapped `today` initialization in `useMemo` in `clubs.tsx` to stabilize the calendar params dep.
4. **TypeScript: HeadersInit** — Fixed `{ Authorization?: undefined }` not assignable to `Record<string, string>` in `directory.tsx` by typing the headers variable explicitly.
5. **TypeScript: ClubDetail.member_count** — Removed reference to non-existent `member_count` field on `ClubDetail` type in `ClubDetailModal.tsx`.

---

## KNOWN REMAINING ISSUES

- The `clubs.tsx` stats card for "Notifications" reads from the notifications endpoint which requires auth — it returns 0 when the endpoint is unavailable, which is fine as a fallback.
- Login page fetches `/api/clubs?limit=1000` without auth to show a club count stat on the left panel. If the clubs endpoint requires auth, the stat shows "—" (handled gracefully).
- The admin page uses `useGetClubs({ limit: 1000 })` to derive all analytics, which may be slow for large club counts. A dedicated admin stats endpoint would be more efficient.
- `ClubDetail` type from the generated API client does not include `member_count` — this field is available on `ClubEntry` (used in directory/clubs pages) but not on the club detail endpoint. The club detail modal omits the member count as a result.
- A `category` field (arts/stem/athletics/etc.) does not exist on clubs; the app cycles through 7 Station category colors by `club.id % 7` as a deterministic approximation. Adding a real `category` field to the clubs table would allow accurate color mapping.

---

## TYPESCRIPT OUTPUT

```
(no errors)
```
`npx tsc --noEmit` exits 0 with no diagnostic output.

---

## ESLINT OUTPUT

```
(no errors or warnings)
```
`pnpm run lint` exits 0 with no diagnostic output.

---

## NEXT RECOMMENDED TASKS

1. **Add `category` field to clubs** — Add an enum column `category` (arts/stem/athletics/environment/culture/service/academic) to the clubs DB table and expose it in the API. Update `getClubColor` to use the actual category rather than cycling by id.
2. **Admin analytics endpoint** — Add `GET /api/admin/stats` returning real enrollment rate, student counts, event totals, and grade breakdown. Gate with `is_admin` middleware.
3. **Mobile sidebar** — Implement the hamburger menu and slide-in drawer for the left sidebar on small screens (the TODO comment is in `NavBar.tsx`).
4. **Attendance tracking** — The Leadership Hub and Your Clubs pages both have "Avg. Attendance" / "Hours Logged" placeholder stats waiting for a tracking feature.
5. **Admin permissions UI** — The Permissions tab in `/admin` is a placeholder. Wire it to a role management API once the backend supports it.
6. **Dark mode** — The Appearance settings tab placeholder mentions a theme toggle. Implement by adding `data-theme="dark"` to `<html>` and a matching set of CSS custom properties.
