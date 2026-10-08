# CampusConnect Architecture

## Overview

CampusConnect is a client–server web application. A React single-page app talks to a
Spring Boot REST API, which persists data in MySQL through JPA/Hibernate.

```
React frontend (Vite, Tailwind, React Router, Axios)
        │  HTTP/JSON  (/api/**)
        ▼
Spring Boot REST API
        │
   Controller   – HTTP layer: request mapping, validation, response codes
        │
   Service      – business logic, transactions
        │
   Repository   – Spring Data JPA interfaces
        │
   JPA/Hibernate
        │
        ▼
      MySQL
```

## Backend (`backend/`)

Base package: `com.campusconnect`

| Package      | Responsibility                                              |
|--------------|-------------------------------------------------------------|
| `config`     | Application configuration (CORS, security filter chain, beans) |
| `controller` | REST controllers, mapped under `/api/...`                   |
| `dto`        | Request/response objects exchanged with the frontend        |
| `entity`     | JPA entities mapped to database tables                      |
| `repository` | Spring Data JPA repositories                                |
| `service`    | Business logic used by controllers                          |
| `security`   | Authentication/authorization components (future)           |
| `exception`  | Custom exceptions and global exception handling            |
| `util`       | Shared helpers                                              |

Conventions:

- Controllers never call repositories directly; they go through services.
- Controllers accept and return DTOs, not entities.
- All endpoints live under `/api` (CORS is configured for `/api/**`).
- Configuration that differs per environment or is secret comes from environment variables
  (see `backend/.env.example`).

### Security

`spring-boot-starter-security` is included for future integration. Until the authentication
module is built, `config/SecurityConfig` permits all requests and enables CORS. It is
stateless with CSRF disabled, as is typical for a token-based REST API.

### CORS

`config/CorsConfig` reads allowed origins from `app.cors.allowed-origins`
(env var `CORS_ALLOWED_ORIGINS`, comma-separated, default `http://localhost:5173`).

## Frontend (`frontend/`)

| Folder        | Responsibility                                  |
|---------------|-------------------------------------------------|
| `components/` | Reusable UI components                          |
| `pages/`      | Route-level page components                     |
| `layouts/`    | Shared page layouts (header/footer wrappers)    |
| `services/`   | API clients; `api.js` is the shared Axios instance |
| `context/`    | React context providers for shared state        |
| `hooks/`      | Custom React hooks                              |
| `assets/`     | Images, icons, static files                     |

All HTTP calls should go through `services/api.js`, whose base URL comes from
`VITE_API_BASE_URL` (default `http://localhost:8080/api`).

## Database (`database/`)

`schema.sql` currently only creates the `campusconnect` database. Feature tables will be
added once the team finalizes the schema.
