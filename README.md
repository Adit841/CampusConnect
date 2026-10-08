# CampusConnect

CampusConnect is a collaborative college web application that brings students and faculty
together in one place: academics, announcements, chat, clubs, and profiles. This repository
currently contains the shared project foundation; feature modules will be built on top of it.

## Technology Stack

**Frontend:** React, JavaScript, Vite, Tailwind CSS, React Router, Axios

**Backend:** Java 21, Spring Boot, Spring Web, Spring Data JPA, Spring Security (for future
integration), Maven

**Database:** MySQL

## Architecture

```
React frontend
      ↓  REST API (JSON over HTTP, /api/**)
Spring Boot
      ↓
Controller → Service → Repository
      ↓
JPA/Hibernate
      ↓
MySQL
```

See [`docs/architecture.md`](docs/architecture.md) for package responsibilities and conventions.

## Project Structure

```
CampusConnect/
├── backend/     Spring Boot REST API (com.campusconnect)
├── frontend/    React + Vite single-page app
├── database/    SQL scripts
└── docs/        Project documentation
```

## Prerequisites

- Java 21 (JDK)
- Maven 3.9+
- Node.js 20+ and npm
- MySQL 8+

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd CampusConnect
```

### 2. Database setup

Start MySQL, then create the database:

```bash
mysql -u <your-mysql-user> -p < database/schema.sql
```

### 3. Backend

The backend reads configuration from environment variables. Credentials are never stored in
the repository. See `backend/.env.example` for all supported variables.

```bash
cd backend
export DB_USERNAME=<your-mysql-user>
export DB_PASSWORD=<your-mysql-password>
# Optional: DB_URL, SERVER_PORT, JPA_DDL_AUTO, JPA_SHOW_SQL, CORS_ALLOWED_ORIGINS

mvn spring-boot:run
```

The API runs at `http://localhost:8080`. If you use an IDE, set the same environment
variables in your run configuration.

To only compile: `mvn clean compile`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Optionally copy `frontend/.env.example` to `frontend/.env.local` to point the app at a
different backend URL (`VITE_API_BASE_URL`, default `http://localhost:8080/api`).

### CORS

The backend allows requests from `http://localhost:5173` to `/api/**` by default. To allow
other origins, set `CORS_ALLOWED_ORIGINS` to a comma-separated list, for example:

```bash
export CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Git Collaboration

1. **Never commit directly to `main`.** Keep `main` stable and deployable.
2. **Sync before starting work:**
   ```bash
   git checkout main
   git pull origin main
   ```
3. **Create a feature branch** using the pattern `feature/<module>-<short-description>`:
   ```bash
   git checkout -b feature/clubs-list-page
   ```
   Use `fix/...` for bug fixes and `docs/...` for documentation.
4. **Commit small, focused changes** with clear messages, e.g. `Add club list endpoint`.
5. **Keep your branch up to date** with `main` to reduce conflicts:
   ```bash
   git fetch origin
   git rebase origin/main   # or: git merge origin/main
   ```
6. **Push and open a Pull Request** into `main`:
   ```bash
   git push -u origin feature/clubs-list-page
   ```
7. **At least one teammate reviews** every Pull Request before it is merged.
8. **Never commit secrets** (`.env` files, passwords, keys). Use environment variables and
   update the `.env.example` files when adding new settings.
9. **Coordinate shared files.** Changes to `pom.xml`, `package.json`, shared config,
   `database/schema.sql`, or shared layouts should be discussed with the team first.
