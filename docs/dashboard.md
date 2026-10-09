# Shared Dashboard

The shared dashboard shell (sidebar, header, mobile drawer, light/dark theme) and the
role-specific Student / Teacher / Admin overviews live in `frontend/`.

## Routes

| Path             | Page                                   | Visible to               |
|------------------|----------------------------------------|--------------------------|
| `/`              | `Home` (unchanged, uses `MainLayout`)  | Everyone                 |
| `/dashboard`     | `DashboardPage` → role-specific view   | Signed-in users          |
| `/profile`       | `ProfilePage` (read-only)              | Signed-in users          |
| `/academics`     | `ModulePlaceholder`                    | `STUDENT`, `TEACHER`     |
| `/announcements` | `ModulePlaceholder`                    | Signed-in users          |
| `/clubs`         | `ModulePlaceholder`                    | Signed-in users          |
| `/chat`          | `ModulePlaceholder`                    | Signed-in users          |

The dashboard is chosen from the signed-in user's role, never from the URL. Sidebar links and
quick actions are defined once in `src/config/navigation.js`.

**Module owners:** when your page is ready, replace the `ModulePlaceholder` element for your
route in `src/App.jsx`. Keep the route inside the `DashboardLayout` group to get the shared shell.

## Authentication integration (Auth & Profiles module)

`src/context/AuthContext.jsx` is the frontend view of the existing backend JWT auth.

- After `POST /api/auth/login` succeeds, call `signIn(authResponse)` from `useAuth()`.
  This sets the `Authorization: Bearer …` header on the shared Axios instance (`services/api.js`)
  and loads the full profile from `GET /api/profile`.
- `signOut()` clears the token and user.
- The token is held **in memory only**. Persisting it (and choosing where) is the auth module's
  decision; restore it on startup by calling `signIn` again.
- There is no login route yet. In **development builds only**, when nobody is signed in, a
  fictional demo user is shown with a "Demo role" selector so each dashboard can be previewed.
  Production builds show a "Sign in required" screen instead.

Hiding links or pages by role is a UX convenience, **not a security boundary**. The backend must
authorize every request (e.g. role checks in `SecurityConfig` or `@PreAuthorize`).

## Data sources

Every dashboard section shows a **"Demo data"** badge while it uses mock data.

| Section                                  | Source today                            |
|------------------------------------------|-----------------------------------------|
| User name, role, department, photo       | `GET /api/profile` (live) or demo user  |
| Student assignments / deadlines          | Mock (`src/data/mockDashboardData.js`)  |
| Teacher assignments / pending reviews    | Mock                                    |
| Announcements                            | Mock                                    |
| Events / active clubs                    | Mock                                    |
| Activity feeds                           | Mock                                    |
| Admin user counts                        | Mock                                    |
| Notifications (header bell)              | Not connected — explains this honestly  |

To switch a section to live data, replace the mock in `src/services/dashboardService.js` with an
`api.get(...)` call, map the response to the same shape, and return `source: 'api'`.

In development you can append `?demoState=loading`, `?demoState=empty` or `?demoState=error` to
`/dashboard` to preview those states.

### Suggested endpoint contracts (not implemented — for the owning modules to decide)

These are the shapes the dashboard components consume. They are suggestions, not existing APIs.

- **Academics:** `GET /api/assignments?scope=mine&upcoming=true` →
  `[{ id, title, courseName, dueAt }]`; for teachers also `submittedCount`, `totalStudents`.
  `GET /api/submissions?status=PENDING_REVIEW` → `[{ id, studentName, assignmentTitle, submittedAt }]`.
- **Announcements:** `GET /api/announcements?limit=5` → `[{ id, title, authorName, audience, createdAt }]`.
- **Clubs & Events:** `GET /api/events?upcoming=true&limit=5` → `[{ id, title, clubName, startsAt, location }]`;
  active club count for admins.
- **Admin:** `GET /api/admin/stats` (ADMIN only) → `{ totalUsers, students, teachers, admins, activeClubs }`.
- **Activity:** `GET /api/activity?limit=5` → `[{ id, text, createdAt }]`.

## Theme

Dark mode uses a `.dark` class on `<html>` (`@custom-variant dark` in `src/index.css`).
The choice is stored in `localStorage` (`cc-theme`); without a saved choice the OS preference is
used. A small inline script in `index.html` applies the class before first paint to avoid a flash.
