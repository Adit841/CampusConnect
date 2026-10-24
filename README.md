# CampusConnect

The live site can take a minute or two to open on the first visit while the server wakes up.

**Live demo:** [campusconnect-z5v6.onrender.com](https://campusconnect-z5v6.onrender.com/)

**Demo logins** (student and teacher): see [`docs/demo-accounts.md`](docs/demo-accounts.md).

**One place for campus life.** CampusConnect is a full-stack college web app that brings
students, teachers, and admins together: classes and assignments, announcements, clubs and
events, a campus community board, and real-time private chat.

Built with **React + Vite** on the frontend, **Spring Boot (Java 21)** on the backend, and
**MySQL** for storage.

---

## Table of Contents

- [Features](#features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Getting Started (Local Setup)](#getting-started-local-setup)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Deployment with Docker](#deployment-with-docker)
- [API Overview](#api-overview)
- [Documentation](#documentation)
- [Team](#team)
- [Contributing](#contributing)

---

## Features

| Module | What you can do |
|---|---|
| **Authentication & Profiles** | Register as a student or teacher, log in with a JWT token, view and edit your profile (college, department, enrollment number, etc.). |
| **Role-based Dashboard** | A different home screen for students, teachers, and admins, with a sidebar, mobile menu, and light/dark theme. |
| **Academics** | Teachers create subjects and assignments (with file attachments). Students submit work, and teachers review and grade submissions. |
| **Announcements** | Teachers and admins post announcements; everyone can browse, filter, and read them. |
| **Clubs & Events** | Discover campus clubs, join or leave them, browse upcoming and past events, register for events (with capacity limits), and manage events as an organizer. |
| **Community & Chat** | A campus discussion and feedback board (posts, upvotes, comments, reporting, admin moderation) plus real-time one-to-one chat with online/offline presence. |
| **Landing Page** | A public home page that introduces the app before sign-in. |

---

## User Roles

| Role | How you get it | What it is for |
|---|---|---|
| `STUDENT` | Sign up on the Register page | Submit assignments, join clubs, register for events, chat, post in the community |
| `TEACHER` | Sign up on the Register page | Manage subjects and assignments, grade submissions, post announcements |
| `ADMIN` | **Cannot** sign up publicly. Set `ADMIN_PROVISION_EMAIL` (and optionally `ADMIN_PROVISION_PASSWORD`) on the backend; on startup that account is created or promoted to admin. | Manage clubs, moderate the community, oversee everything |

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, React Router, Axios, STOMP + SockJS (real-time chat), Lucide icons |
| **Backend** | Java 21, Spring Boot, Spring Web, Spring Data JPA, Spring Security + JWT, Spring WebSocket (STOMP), Maven |
| **Database** | MySQL 8 (local or a hosted MySQL such as Aiven) |
| **Deployment** | Docker (single container serving both the website and the API) |

---

## How It Works

```
          Browser (React single-page app)
              │                     │
   REST API (JSON, /api/**)   WebSocket (/ws/sockjs)
              │                     │   real-time chat & presence
              ▼                     ▼
        ┌────────────────────────────────┐
        │        Spring Boot backend      │
        │  Controller → Service → Repo    │
        │  JWT security on every request  │
        └────────────────────────────────┘
                       │  JPA / Hibernate
                       ▼
                     MySQL
```

- The frontend calls the backend's REST API for all data and sends a JWT token in the
  `Authorization` header once the user logs in.
- Chat messages travel over a WebSocket connection so they appear instantly, without refreshing.
- Uploaded assignment files are stored on the server's disk (not in the database).
- On first start, the backend fills the database with a directory of sample clubs and events,
  so the Clubs & Events page is not empty.

More detail on the backend layers is in [`docs/architecture.md`](docs/architecture.md).

---

## Project Structure

```
CampusConnect/
├── backend/                  Spring Boot REST API (package com.campusconnect)
│   ├── src/main/java/.../
│   │   ├── config/           Security, CORS, WebSocket, data seeding, .env loading
│   │   ├── controller/       REST + WebSocket endpoints (/api/**)
│   │   ├── service/          Business logic
│   │   ├── repository/       Database access (Spring Data JPA)
│   │   ├── entity/           Database tables as Java classes
│   │   ├── dto/              Request/response objects sent to the frontend
│   │   ├── security/         JWT creation and validation
│   │   └── exception/        Error handling
│   ├── src/test/             Unit and controller tests
│   └── .env.example          Template for backend settings
├── frontend/                 React + Vite app
│   ├── src/pages/            One file per screen (Dashboard, Academics, Chat, ...)
│   ├── src/components/       Reusable UI, grouped by module
│   ├── src/services/         API calls (Axios)
│   ├── src/hooks/            Custom React hooks (chat, presence, data loading)
│   ├── src/context/          Auth and theme state
│   └── .env.example          Template for frontend settings
├── database/schema.sql       SQL script to create the database tables
├── docs/                     Documentation, SRS, UML diagrams, and project reports
└── Dockerfile                Builds the whole app into one deployable image
```

---

## Getting Started (Local Setup)

### Prerequisites

Install these first:

- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 20+** and npm
- **MySQL 8+** (running locally), or access to a hosted MySQL database

### 1. Clone the repository

```bash
git clone https://github.com/Adit841/CampusConnect.git
cd CampusConnect
```

### 2. Create the database

Start MySQL, then run the schema script. It creates a database called `campusconnect`.

```bash
mysql -u <your-mysql-user> -p < database/schema.sql
```

### 3. Configure and start the backend

Copy the example settings file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and set at least:

- `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD`: your MySQL login
- `JWT_SECRET`: any long random string. The backend **will not start** without it.
  You can generate one with `openssl rand -base64 48`.
- *(Optional)* `ADMIN_PROVISION_EMAIL` and `ADMIN_PROVISION_PASSWORD`: to create an admin account

The backend loads `backend/.env` automatically. Then start it:

```bash
mvn spring-boot:run
```

The API is now running at **http://localhost:8080**.

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. Register an account and you are in.

> The Vite dev server forwards `/api` and `/ws` requests to `localhost:8080`, so the default
> setup works without changing any frontend settings.

---

## Configuration

All settings come from environment variables (or `backend/.env` locally). **Never commit real
passwords or secrets.** The full list with comments is in
[`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example).

### Backend

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | No | local MySQL `campusconnect` | Database connection URL |
| `SPRING_DATASOURCE_USERNAME` | Yes | `root` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | Yes | *(empty)* | Database password |
| `JWT_SECRET` | **Yes** | none | Secret used to sign login tokens |
| `JWT_EXPIRATION_MS` | No | `86400000` (24 hours) | How long a login lasts |
| `CORS_ALLOWED_ORIGINS` | No | `localhost:5173` and a few other local ports | Frontend URLs allowed to call the API (comma-separated) |
| `ADMIN_PROVISION_EMAIL` / `ADMIN_PROVISION_PASSWORD` | No | none | Creates or promotes an admin account on startup |
| `ACADEMICS_STORAGE_DIR` | No | `uploads/academics` | Where uploaded assignment files are saved |
| `ACADEMICS_MAX_FILE_MB` | No | `10` | Max upload size per file |
| `SERVER_PORT` | No | `8080` | Backend port |

The older names `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` also work.

### Frontend (optional)

Only needed if the backend is not on `localhost:8080`. Copy `frontend/.env.example` to
`frontend/.env.local` and set:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | REST API base URL |
| `VITE_WS_BASE_URL` | `http://localhost:8080/ws/sockjs` | Chat WebSocket URL |

---

## Running Tests

The backend has unit and controller tests for every module:

```bash
cd backend
mvn test
```

Run just one test class, for example:

```bash
mvn test -Dtest=ClubServiceTest
```

To check that the frontend builds cleanly:

```bash
cd frontend
npm run build
```

---

## Deployment with Docker

The `Dockerfile` builds the React app, bundles it inside the Spring Boot app, and produces a
single image. The backend then serves both the website and the API from the same address, so
no CORS setup is needed.

```bash
docker build -t campusconnect .

docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://<host>:<port>/<db>?sslMode=REQUIRED" \
  -e SPRING_DATASOURCE_USERNAME=<user> \
  -e SPRING_DATASOURCE_PASSWORD=<password> \
  -e JWT_SECRET=<long-random-secret> \
  campusconnect
```

Then open **http://localhost:8080**.

The image runs with the `prod` profile, which **requires** database credentials and
`JWT_SECRET` (it never falls back to local defaults). It also respects the `PORT` variable
that hosting platforms such as Render set. Mount a persistent volume for
`ACADEMICS_STORAGE_DIR` so uploaded files survive restarts.

---

## API Overview

All REST endpoints start with `/api`. Apart from register and login, they need an
`Authorization: Bearer <token>` header.

| Area | Base path | Examples |
|---|---|---|
| Auth | `/api/auth` | `POST /register`, `POST /login` |
| Profile | `/api/profile` | `GET` your profile, `PUT` to update it |
| Subjects | `/api/subjects` | List, create, update subjects; list a subject's assignments |
| Assignments | `/api/assignments` | Create, publish, attach files, submit work, list submissions |
| Submissions | `/api/submissions` | View your submissions, resubmit, grade, download the file |
| Announcements | `/api/announcements` | List, read, create, update, delete |
| Clubs | `/api/clubs` | Browse, view, create, join, leave, my memberships |
| Events | `/api/events` | Landing feed, upcoming and past events, register, attendee list |
| Community | `/api/community` | Posts, upvotes, comments, reports, moderation logs |
| Chat | `/api/conversations` | List and start conversations, load and send messages |
| Presence | `/api/presence` | Check whether users are online |
| WebSocket | `/ws/sockjs` | Real-time chat (send to `/app/chat.send`, receive on `/topic/conversations/{id}`) |

Detailed contracts for individual modules:

- Clubs & Events: [`CLUBS_EVENTS_MODULE.md`](CLUBS_EVENTS_MODULE.md)
- Chat: [`docs/chat-module.md`](docs/chat-module.md)

---

## Documentation

| Document | Location |
|---|---|
| Demo student and teacher logins | [`docs/demo-accounts.md`](docs/demo-accounts.md) |
| Architecture and coding conventions | [`docs/architecture.md`](docs/architecture.md) |
| Dashboard and frontend shell | [`docs/dashboard.md`](docs/dashboard.md) |
| Chat module | [`docs/chat-module.md`](docs/chat-module.md) |
| Clubs & Events module | [`CLUBS_EVENTS_MODULE.md`](CLUBS_EVENTS_MODULE.md) |
| Software Requirements Specification (IEEE format) | [`docs/SRS/`](docs/SRS/) |
| UML diagrams | [`docs/UML/`](docs/UML/) |
| Project report and individual member reports | [`docs/reports/`](docs/reports/) |

---

## Team

| Member | Main contribution |
|---|---|
| Aditya Gour(24EARCS008) | Project setup, landing page, role-based dashboard, academics page, security and performance fixes, college registration flow, Docker deployment |
| Aman Kumar Chauhan(24EARCS017) | Authentication, user profiles, shared database and deployment settings, UML diagrams, SRS |
| Anjali Kumari(24EARCS020) | Announcements module |
| Aayushman Pathak(24EARCS003) | Chat,presence, Community & Feedback hub, Clubs & Events module |
| Akshat Verma(24EARCS015) | Academics: subjects, assignments, and submissions |

**PBL Team ID:** `PBL2627-CSE-A-019`

Individual reports for each member are in [`docs/reports/`](docs/reports/).

---

## Contributing

1. **Never commit directly to `main`.** Keep it stable and deployable.
2. **Start from the latest `main`:**
   ```bash
   git checkout main
   git pull origin main
   ```
3. **Create a branch** named after you or the feature, for example
   `aditya/registration-college` or `feature/clubs-list-page`. Use `fix/...` for bug fixes and
   `docs/...` for documentation.
4. **Make small, focused commits** with clear messages, such as `feat(clubs): add join button`.
5. **Stay up to date with `main`** to avoid conflicts:
   ```bash
   git fetch origin
   git merge origin/main
   ```
6. **Push and open a Pull Request** into `main`. At least one teammate reviews it before merging.
7. **Never commit secrets** (`.env` files, passwords, keys). When you add a new setting, add it
   to the matching `.env.example` file too.
8. **Talk to the team first** before changing shared files: `pom.xml`, `package.json`,
   `database/schema.sql`, security config, or shared layouts.
