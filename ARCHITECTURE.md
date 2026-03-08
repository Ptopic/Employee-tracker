# saveit Architecture (PTO-257)

## Scope
Manager-only employee scheduling and time tracking.

## Monorepo layout

- `app/` (Expo / React Native)
  - `app/(tabs)/index.tsx` → Home
  - `app/(tabs)/calendar.tsx` → Calendar
  - `app/(tabs)/employees.tsx` → Employees
  - `app/(tabs)/settings.tsx` → Settings
- `backend/` (NestJS + Prisma)
  - `src/managers`
  - `src/employees`
  - `src/shifts`
  - `src/shift-assignments`
  - `src/prisma`

## Data model

- `Manager` (googleAuthId, companyName, preferences)
- `Employee` (identity + hourlyRate + status)
- `Shift` (date + start/end time)
- `ShiftAssignment` (shift↔employee + calculatedHours)

## API foundations (initial)

Read-only bootstrap endpoints (for scaffolding/testing):

- `GET /managers`
- `GET /employees`
- `GET /shifts`
- `GET /shift-assignments`

## Local persistence schema (PTO-252)

The app includes an offline-first SQLite schema under `app/data/local-persistence/`.

### Tables

- `managers`
- `employees`
- `shifts`
- `shift_assignments`
- `local_sync_checkpoints`
- `local_outbox_events`

### Notes

- Entity fields mirror backend Prisma naming/constraints where possible.
- Foreign keys are enabled and enforced (`PRAGMA foreign_keys = ON`).
- Schema versioning is handled via `_local_schema_meta` + ordered migrations.

## Next steps

1. Add auth flow (Google sign-in + manager bootstrap)
2. Add create/update/delete endpoints for employees and shifts
3. Add overlap validation + deterministic hour calculations
4. Wire app screens to backend endpoints
