# Architecture — PTO-257 Setup & Foundation

## 1) Scope and principles

This baseline is scoped to a **manager-only** mobile product. Architecture decisions prioritize:

1. Clear module boundaries aligned with PRD domains
2. Fast iteration for early feature tickets
3. Simple, extensible data model for scheduling workflows
4. Backend/API and mobile structure that can evolve independently

---

## 2) Mobile architecture (Expo + React Native)

### Routing & navigation
- **Expo Router** is used for file-based routing.
- Root route mounts a **bottom-tab shell** with 4 primary surfaces:
  - Home
  - Calendar
  - Employees
  - Settings

### Module boundaries
Feature code is organized under `app/modules/*` to align with product domains:
- `modules/home`
- `modules/calendar`
- `modules/employees`
- `modules/settings`

Route files under `app/(tabs)` are intentionally thin and delegate UI to module screens.

### Shared state management
A lightweight app-level provider (`AppStateProvider`) lives under `app/shared/state` and is mounted in root layout.

Purpose in this phase:
- establish a single, explicit pattern for shared cross-screen state
- avoid coupling feature modules directly to navigation internals

Current shared state includes `selectedManagerId` as a seed for future authenticated manager context.

---

## 3) Backend architecture (NestJS)

### Framework
- **NestJS** with modular architecture
- Domain modules map to core PRD entities:
  - `managers`
  - `employees`
  - `shifts`
  - `shift-assignments`
- `prisma` module provides database access via `PrismaService`

### API style at foundation stage
- Basic controller/service scaffolding per domain module
- Read/list endpoints available for foundational validation and integration setup

---

## 4) Data architecture (Prisma + PostgreSQL)

### ORM & database
- **Prisma ORM** configured with PostgreSQL datasource (`DATABASE_URL`)

### Core entities

#### Manager
- Primary actor in manager-only app
- Contains auth identity and organization-level preferences

#### Employee
- Belongs to a manager
- Tracks staffing details (name, hourly rate, status)

#### Shift
- Belongs to a manager
- Stores shift date and time range

#### ShiftAssignment
- Join entity between shift and employee
- Stores denormalized/computed `calculatedHours`

### Foundational constraints
- FK relationships with cascade delete to preserve ownership boundaries
- Unique `(shiftId, employeeId)` assignment constraint
- Indexes on frequently queried keys (e.g., manager/date)

---

## 5) Why these decisions

1. **Tab shell first:** creates stable UX entry points for parallel feature work.
2. **Module-first app layout:** keeps growth manageable as screens/services increase.
3. **Prisma core schema first:** unblocks backend endpoints and mobile integration contracts.
4. **Nest modular backend:** mirrors product domains for maintainability and ownership.
5. **Minimal shared state provider now:** establishes a convention early without overengineering.

---

## 6) Expected evolution (post-foundation)

- Add authentication/authorization flow for manager sessions
- Expand CRUD operations and validation rules for employees and shifts
- Add scheduling conflict and hour-calculation business rules
- Introduce DTO validation, error taxonomy, and API versioning conventions
- Add integration tests around Prisma-backed modules
