# TicketFlow

TicketFlow is a backend-focused task and support-ticket management API built with **Node.js, Express, TypeScript, and PostgreSQL**. It provides user authentication, role-based access control, user-owned task management, and admin task-management endpoints.

## Features

### Authentication and authorization
- User registration with password hashing using `bcryptjs`.
- User login with password verification.
- JWT access-token generation and verification.
- Protected routes using Bearer-token authentication.
- Admin-only routes protected by role-based middleware.
- Current-user endpoint (`/api/auth/me`).

### User task management
Authenticated users can:
- Create support tasks.
- Retrieve their own tasks.
- Retrieve an individual task by ID.
- Update a task title.
- Delete their own tasks.

Task queries are scoped by the authenticated user's ID so users cannot access or modify another user's tasks through the user task endpoints.

### Admin task management
Administrators can:
- Retrieve tasks across users.
- Search tasks by title.
- Filter tasks by status.
- Update task status.

Supported task statuses:
- `OPEN`
- `IN_PROGRESS`
- `RESOLVED`

### Backend infrastructure
- PostgreSQL connection pooling with `pg`.
- SQL migration files and a custom migration runner.
- Docker Compose for running PostgreSQL.
- Centralized application error handling.
- Pino logging, with `pino-pretty` configured for development.

## Tech stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express 5 | HTTP server and routing |
| TypeScript | Static typing |
| PostgreSQL 16 | Relational database |
| `pg` | PostgreSQL client and connection pool |
| Docker Compose | Local PostgreSQL environment |
| `bcryptjs` | Password hashing and verification |
| `jsonwebtoken` | JWT creation and verification |
| `dotenv` | Environment configuration |
| Pino / `pino-pretty` | Application logging |

## Project structure

```text
TicketFlow/
├── migrations/                 # SQL database migrations
├── src/
│   ├── config/                 # Environment configuration
│   ├── errors/                 # Custom application errors
│   ├── lib/                    # Database, JWT and logger setup
│   ├── middlewares/            # Authentication, admin and error middleware
│   ├── repositories/            # PostgreSQL queries
│   ├── routes/                 # Express route definitions
│   ├── scripts/                # Migration runner
│   ├── services/               # Business logic and validation
│   ├── types/                  # Shared TypeScript types
│   ├── app.ts                  # Express application configuration
│   └── server.ts               # Server entry point
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Getting started

### Prerequisites

Install the following:

- Node.js (a version compatible with the dependencies in `package-lock.json`)
- npm
- Docker Desktop with Docker Compose

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd TicketFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root. Do not commit this file.

```env
PORT=4000
NODE_ENV=development
LOG_LEVEL=info

DATABASE_URL=postgresql://postgres:postgres@localhost:5440/nodejs-ticketFlow

JWT_SECRET=replace_with_a_long_random_secret
JWT_ACCESS_EXPIRES_IN=30m
```

The `DATABASE_URL` above matches the local PostgreSQL service configured in the included Docker Compose file. If you change the database username, password, database name, or host port in `docker-compose.yml`, update the connection string accordingly.

Generate a strong, unique JWT secret for your own environment. Never publish real secrets or credentials.

### 4. Start PostgreSQL

```bash
docker compose up -d
```

The Compose configuration runs PostgreSQL 16 and maps host port `5440` to container port `5432`.

To check the container:

```bash
docker compose ps
```

### 5. Run database migrations

```bash
npm run migrate
```

The migration runner applies pending `.sql` files from the root `migrations/` directory and records executed migrations in the `migrations` table.

### 6. Start the development server

```bash
npm run dev
```

By default, the API runs at:

```text
http://localhost:4000
```

Health check:

```http
GET http://localhost:4000/api/health
```

## API overview

All endpoints are prefixed with `/api`.

### Health

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/health` | Check whether the API is responding | Public |

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Register a user | Public |
| POST | `/auth/login` | Log in and receive an access token | Public |
| GET | `/auth/me` | Get the authenticated user's token claims | Authenticated |

Example registration request:

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

Example login request:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

Use the returned access token on protected endpoints:

```http
Authorization: Bearer <access-token>
```

### User tasks

All user task endpoints require authentication. A user's task operations are scoped to the authenticated user's ID.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/tasks` | Create a task |
| GET | `/tasks` | List the authenticated user's tasks |
| GET | `/tasks/:taskId` | Get one of the authenticated user's tasks |
| PATCH | `/tasks/:taskId` | Update a task title |
| DELETE | `/tasks/:taskId` | Delete one of the authenticated user's tasks |

Example create-task request:

```http
POST /api/tasks
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "title": "Resolve payment issue"
}
```

Example update-task request:

```http
PATCH /api/tasks/<task-id>
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "title": "Updated task title"
}
```

### Admin tasks

These endpoints require a valid JWT belonging to a user whose role is `ADMIN`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/tasks` | List tasks across users |
| GET | `/admin/tasks?search=payment` | Search task titles |
| GET | `/admin/tasks?status=OPEN` | Filter tasks by status |
| GET | `/admin/tasks?search=payment&status=OPEN` | Combine search and status filter |
| PATCH | `/admin/tasks/:taskId/status` | Update a task's status |

Example status update:

```http
PATCH /api/admin/tasks/<task-id>/status
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

```json
{
  "status": "IN_PROGRESS"
}
```

Allowed status values are `OPEN`, `IN_PROGRESS`, and `RESOLVED`.

## Architecture

TicketFlow uses a layered backend structure:

1. **Routes** define API endpoints, receive requests, invoke services, and return HTTP responses.
2. **Middleware** handles cross-cutting request concerns such as JWT authentication, admin authorization, and centralized error handling.
3. **Services** contain application/business logic and input validation.
4. **Repositories** contain SQL queries and database access through the PostgreSQL connection pool.
5. **Types** define shared TypeScript data structures.

For example, creating a task follows this flow:

```text
HTTP request
    ↓
Authentication middleware
    ↓
Task route
    ↓
Task service (validation)
    ↓
Task repository (parameterized SQL)
    ↓
PostgreSQL
    ↓
HTTP response
```

## Database

The project includes SQL migrations for:
- Enabling `pgcrypto`.
- Creating the `users` table.
- Creating the `support_tasks` table.
- Creating the `banners` table.

The application currently uses the `users` and `support_tasks` tables for its implemented authentication and task-management flows. The banners table is part of the database schema; banner upload and Cloudinary integration are not currently implemented.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Run the development server with `tsx watch` |
| `npm run build` | Compile TypeScript using `tsc` |
| `npm run migrate` | Apply pending database migrations |
| `npm run docker:up` | Start the Docker Compose services |
| `npm run docker:down` | Stop the Docker Compose services |

## Current scope and future improvements

The current implementation focuses on authentication, user task CRUD, admin task management, PostgreSQL integration, and the backend architecture around those features.

Potential future enhancements include:
- Pagination and sorting for admin task listing.
- File uploads with Multer and Cloudinary.
- Redis caching and cache invalidation.
- Background jobs and workers with BullMQ.
- Google OAuth login.
- Automated tests and additional request validation.

These are future enhancements, not features currently included in the implemented API.

## Security notes

- Keep `.env` out of version control.
- Use a strong, unique JWT secret.
- Protected endpoints expect `Authorization: Bearer <token>`.
- Passwords are hashed before being stored.
- SQL queries use parameterized values.
- User task queries include the authenticated user's ID.
- Admin endpoints require the `ADMIN` role.

---

**TicketFlow** — a backend project focused on REST API development, authentication, authorization, relational database operations, and layered application architecture.
