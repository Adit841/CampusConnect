# CampusConnect — Clubs & Events Module Foundation

This document provides architectural documentation, database schema specifications, API contracts, frontend component hierarchy, and handoff instructions for continuing development on the **Clubs & Events module**.

---

## 1. Module Overview & Philosophy

The Clubs & Events module establishes an editorial-quality discovery feed and directory for college campus organizations, activities, workshops, competitions, and athletic events. Inspired by authentic collegiate activities (coding clubs, robotics, cultural arts, sports leagues, and environmental chapters), the module blends student discovery with administrative governance.

### Core Pillars:
1. **Discovery First**: Compact, high-signal editorial landing screen highlighting featured campus events, chronological agendas, and club categories without pushing key actions below the fold.
2. **Visual Consistency**: Adheres to CampusConnect's midnight navy, purple (`#4f46e5` / `indigo-600`), and clean neutral surfaces in both dark and light modes.
3. **Data Integrity & Concurrency**: Pessimistic database locking (`LockModeType.PESSIMISTIC_WRITE`) guarantees that event capacity limits are never breached during concurrent registrations.
4. **Transparent Sample Data**: Initial directory entries are flagged with `is_sample_data = true` to clearly distinguish demo records from official verified college organizations.

---

## 2. Architecture & Domain Model

### Entities (`backend/src/main/java/com/campusconnect/entity/`):
- **`Club`**:
  - `id`: `BIGINT` PK (AUTO_INCREMENT)
  - `name`: Unique club title
  - `slug`: URL-friendly identifier (e.g., `arya-cipher-coding-club`)
  - `category`: `ClubCategory` enum (`TECHNICAL`, `CULTURAL`, `SPORTS`, `ACADEMIC`, `SOCIAL`)
  - `tagline`: One-line motto / summary
  - `description`: Detailed overview
  - `activities`: Comma-separated focus areas / tags
  - `logoUrl`, `bannerUrl`: Visual assets
  - `leadCoordinator`: FK to `users(id)`
  - `memberCount`: Running count of approved members
  - `active`: Boolean flag for administrative activation/archival
  - `isSampleData`: Boolean flag distinguishing seeded demo data from live college data
- **`ClubMembership`**:
  - `id`: `BIGINT` PK
  - `club`: FK to `clubs(id)`
  - `user`: FK to `users(id)`
  - Unique constraint: `(club_id, user_id)` (prevents duplicate memberships)
  - `role`: `ClubMemberRole` (`MEMBER`, `COORDINATOR`, `LEAD`)
  - `status`: `MembershipStatus` (`PENDING`, `APPROVED`, `REJECTED`, `INACTIVE`)
  - `joinedAt`: Timestamp
- **`CampusEvent`**:
  - `id`: `BIGINT` PK
  - `title`: Event title
  - `slug`: Unique slug
  - `club`: FK to `clubs(id)` (optional for campus-wide events)
  - `category`: `EventCategory` (`TECHNICAL`, `CULTURAL`, `SPORTS`, `ACADEMIC`, `SOCIAL`)
  - `description`: Event briefing
  - `venue`: Physical venue location
  - `online`: Boolean
  - `meetingUrl`: Virtual session link
  - `startDateTime`, `endDateTime`: Timestamps
  - `registrationDeadline`: Cutoff timestamp for registrations
  - `capacity`: Maximum allowed attendees (null for unlimited)
  - `registeredCount`: Current registered student count
  - `status`: `EventStatus` (`DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`)
  - `organizer`: FK to `users(id)`
  - `featured`: Boolean flag for editorial landing placement
  - `isSampleData`: Boolean flag
- **`EventRegistration`**:
  - `id`: `BIGINT` PK
  - `event`: FK to `campus_events(id)`
  - `user`: FK to `users(id)`
  - Unique constraint: `(event_id, user_id)` (prevents duplicate registrations)
  - `status`: `RegistrationStatus` (`REGISTERED`, `CANCELLED`, `ATTENDED`)
  - `registeredAt`: Timestamp

---

## 3. Database Schema

Tables defined in [`database/schema.sql`](file:///c:/Users/com/Desktop/CampusConnect/database/schema.sql):

```sql
-- 8. Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    tagline VARCHAR(255),
    description TEXT NOT NULL,
    activities TEXT,
    logo_url VARCHAR(512),
    banner_url VARCHAR(512),
    contact_email VARCHAR(120),
    lead_coordinator_id BIGINT,
    member_count INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    is_sample_data BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_coordinator_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_clubs_category (category),
    INDEX idx_clubs_active (active)
);

-- 9. Club Memberships Table
CREATE TABLE IF NOT EXISTS club_memberships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    status VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_club_user (club_id, user_id),
    INDEX idx_club_memberships_user (user_id),
    INDEX idx_club_memberships_club (club_id)
);

-- 10. Campus Events Table
CREATE TABLE IF NOT EXISTS campus_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(210) NOT NULL UNIQUE,
    club_id BIGINT,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    venue VARCHAR(255),
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    meeting_url VARCHAR(512),
    start_date_time DATETIME NOT NULL,
    end_date_time DATETIME,
    registration_deadline DATETIME,
    capacity INT,
    registered_count INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
    organizer_id BIGINT,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_sample_data BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_events_start (start_date_time),
    INDEX idx_events_category (category),
    INDEX idx_events_status (status)
);

-- 11. Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES campus_events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_event_user (event_id, user_id),
    INDEX idx_event_reg_user (user_id),
    INDEX idx_event_reg_event (event_id)
);
```

---

## 4. REST API Specification

### Clubs (`/api/clubs`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/clubs` | Public / Authenticated | Search & filter active clubs with pagination (`search`, `category`, `page`, `size`) |
| `GET` | `/api/clubs/{slug}` | Public / Authenticated | Retrieve full club detail with upcoming events and user membership status |
| `POST` | `/api/clubs` | `ADMIN` | Register new campus club |
| `PUT` | `/api/clubs/{id}` | `ADMIN` or Club Coordinator | Update club information |
| `POST` | `/api/clubs/{id}/join` | Authenticated Student | Join club (atomic increment of `member_count`) |
| `DELETE` | `/api/clubs/{id}/leave` | Authenticated Student | Leave club (atomic decrement of `member_count`) |
| `GET` | `/api/clubs/my/memberships` | Authenticated User | Retrieve authenticated user's club memberships |

### Events (`/api/events`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/events/landing` | Public / Authenticated | Editorial landing feed: featured event, timeline agenda, popular clubs, category counts |
| `GET` | `/api/events` | Public / Authenticated | List upcoming events sorted deterministically (`startDateTime ASC, id ASC`) |
| `GET` | `/api/events/past` | Public / Authenticated | List past events archive sorted `startDateTime DESC` |
| `GET` | `/api/events/{slug}` | Public / Authenticated | Retrieve event details with user registration status |
| `POST` | `/api/events` | `ADMIN`, `TEACHER`, or Club Coordinator | Publish new campus event |
| `PUT` | `/api/events/{id}` | Event Organizer or `ADMIN` | Update event details |
| `POST` | `/api/events/{id}/register` | Authenticated Student | Register for event with concurrency-safe pessimistic capacity lock |
| `DELETE` | `/api/events/{id}/register` | Authenticated Student | Cancel event registration (atomic decrement of `registered_count`) |
| `GET` | `/api/events/my/registrations` | Authenticated User | Retrieve authenticated user's confirmed registrations |
| `GET` | `/api/events/{id}/attendees` | Event Organizer or `ADMIN` | Retrieve paginated roster of registered attendees (strictly forbidden for ordinary students) |

---

## 5. Frontend Architecture & Components

All frontend code lives in `frontend/src/`:
- **Page Container**: [`frontend/src/pages/ClubsEventsPage.jsx`](file:///c:/Users/com/Desktop/CampusConnect/frontend/src/pages/ClubsEventsPage.jsx)
  - Connected to route `/clubs` inside `DashboardLayout` in [`App.jsx`](file:///c:/Users/com/Desktop/CampusConnect/frontend/src/App.jsx).
  - 5 interactive tabs:
    1. **Campus Feed**: Hero, category strip, featured event, chronological agenda timeline, and popular clubs.
    2. **Clubs Directory**: Search by title/tags, category filter, club cards with join/leave and detail modals.
    3. **Events Directory**: Upcoming vs Past sub-tabs, chronological cards, capacity bars, register/cancel actions.
    4. **My Activity**: Personalized student tab for event registrations and club memberships.
    5. **Organizer Hub**: Management view for coordinators/admins to create events/clubs and inspect attendee rosters.
- **Components** (`frontend/src/components/clubs/`):
  - `CategoryDiscoveryStrip.jsx`: Visual category selector with icons and live count badges.
  - `FeaturedEventCard.jsx`: Editorial dark-glass hero card for highlighted campus events.
  - `EventCard.jsx`: Reusable event card with calendar date box, category pill, capacity meter, and registration actions.
  - `EventAgendaTimeline.jsx`: Chronological timeline grouped into Today, Tomorrow, Later This Week, and Coming Up.
  - `ClubCard.jsx`: Club directory card with category styling, member counts, tagline, and join actions.
  - `ClubDetailModal.jsx`: Modal view detailing club vision, focus areas, coordinators, and upcoming events.
  - `EventDetailModal.jsx`: Modal view with venue/virtual links, capacity meter, deadline warnings, and registration CTA.
  - `MyActivitySection.jsx`: User-specific registration and membership manager.
  - `AttendeeListModal.jsx`: Organizer attendee roster with search filter and student contact information.
  - `CreateEventModal.jsx`: Event creation dialog with date and capacity validation.
  - `CreateClubModal.jsx`: Administrator dialog to register new campus organizations.
- **Service Layer**: [`frontend/src/services/clubsEventsApi.js`](file:///c:/Users/com/Desktop/CampusConnect/frontend/src/services/clubsEventsApi.js) (Axios client with bearer auth).

---

## 6. How to Run and Test

### Backend:
```bash
# Inside backend/
mvn spring-boot:run
```
To run the automated test suite:
```bash
mvn test -Dtest=CampusEventServiceTest,ClubServiceTest
```

### Frontend:
```bash
# Inside frontend/
npm run dev     # Starts Vite dev server (e.g. http://localhost:5173 or 5174)
npm run build   # Validates production bundle
```

---

## 7. Known Limitations & Next Steps for Akshat

### Current Scope & Limitations:
1. **Club Image Uploads**: Currently uses URL strings (`logoUrl`, `bannerUrl`). An S3/Cloudinary or local multipart file upload endpoint can be connected next.
2. **Email Reminders**: Events support `registrationDeadline`, but background email/push reminders prior to the deadline or event start time have not been scheduled yet.
3. **Ticket QR Code**: Registration currently stores status `REGISTERED`. An optional QR code ticket generator could be added to `EventRegistrationDto` for on-site scanning at physical venues.
4. **Club Roles**: Simple roles (`MEMBER`, `COORDINATOR`, `LEAD`) are defined. Full granular sub-committee permissions can be expanded as clubs request them.

### Recommended Next Steps for Akshat:
- [ ] Connect file upload for club banners/logos.
- [ ] Implement an ICS calendar export button (`Download .ics`) on `EventDetailModal` for Apple/Google Calendar sync.
- [ ] Add check-in attendance toggle in `AttendeeListModal` for event coordinators to mark students as `ATTENDED`.
- [ ] Connect WebSocket notifications when an event registration deadline is approaching or when an event is cancelled.
