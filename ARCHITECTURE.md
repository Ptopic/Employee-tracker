# PRD: App architecture + folder structure (PTO-229)

## 1) Goal
Define a clear, scalable architecture for the **manager-only employee scheduling app** and standardize folder structure across mobile and backend codebases.

## 2) Architecture overview

- **Client:** Expo + React Native (`app/`)
- **API:** NestJS (`backend/src/`)
- **Data layer:** Prisma ORM (`backend/prisma/`)
- **Auth:** Google-based manager authentication (backend-driven)

### High-level flow
1. Mobile app authenticates manager (Google sign-in).
2. App calls backend APIs for managers, employees, shifts, and assignments.
3. Backend validates business rules and persists data via Prisma.
4. App renders schedule/dashboard state from API responses.

## 3) Repository layout

```text
Employee-tracker/
├── app/                 # Expo React Native client
│   ├── app/             # Expo Router routes (tabs + screens)
│   │   ├── (tabs)/
│   │   │   ├── index.tsx      # Home
│   │   │   ├── calendar.tsx   # Calendar
│   │   │   ├── employees.tsx  # Employees
│   │   │   └── settings.tsx   # Settings
│   │   └── getStarted/
│   ├── api/             # API clients grouped by domain
│   ├── components/      # Reusable UI components
│   ├── constants/       # App constants/theme values
│   ├── feature/         # Feature-specific UI/state helpers
│   ├── hooks/           # Shared React hooks
│   ├── types/           # Frontend TypeScript types
│   └── utils/           # Utility helpers
│
├── backend/             # NestJS API
│   ├── src/
│   │   ├── auth/               # Auth module (guards/strategies/dtos)
│   │   ├── managers/           # Manager domain
│   │   ├── employees/          # Employee domain
│   │   ├── shifts/             # Shift domain
│   │   ├── shift-assignments/  # Assignment domain
│   │   ├── prisma/             # Prisma service/module
│   │   ├── users/              # Shared user logic
│   │   ├── types/              # Backend shared types
│   │   └── utils/              # Backend utilities
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── test/
│
└── ARCHITECTURE.md      # This document
```

## 4) Domain boundaries

### Frontend domains
- **Auth:** Sign-in/session bootstrap.
- **Home:** Weekly stats + today schedule summary.
- **Calendar:** Month/week navigation and staffing visibility.
- **Employees:** Employee CRUD and status management.
- **Settings:** Manager profile and app preferences.

### Backend domains
- **Managers:** Company and preference ownership.
- **Employees:** Employee records scoped to manager/company.
- **Shifts:** Shift definitions (date/time).
- **ShiftAssignments:** Shift-to-employee allocation with hours.

## 5) Data model baseline

- `Manager`
  - `googleAuthId`, `email`, `companyName`, `preferences`
- `Employee`
  - Identity fields, role/contact info, `hourlyRate`, `status`
- `Shift`
  - `date`, `startTime`, `endTime`, metadata
- `ShiftAssignment`
  - `shiftId`, `employeeId`, `calculatedHours`

## 6) Conventions

- Keep modules **feature/domain-first** (avoid unrelated cross-module logic).
- Keep DTO/types close to their owning module.
- Prefer reusable shared utilities for pure helpers only.
- Route files should stay thin and delegate logic to feature/domain layers.
- Enforce manager data isolation in all backend queries/mutations.

## 7) Non-goals for PTO-229

- No new product features.
- No schema expansion beyond existing baseline entities.
- No endpoint behavior changes.

## 8) Implementation sequence alignment

1. Foundation & architecture (this issue)
2. Authentication flow
3. Home/dashboard
4. Calendar & shift management
5. Employee management
6. Settings/preferences
7. PDF export and hardening
