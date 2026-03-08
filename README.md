# Saveit — Manager App Foundation (PTO-257)

This repository contains the baseline architecture for a **manager-only employee scheduling app**.

- **Mobile:** React Native (Expo, iOS/Android)
- **Backend:** NestJS + Prisma
- **Database:** PostgreSQL

---

## What this foundation includes

### Mobile app foundation
- Expo Router navigation setup
- Bottom-tab shell with:
  - Home
  - Calendar
  - Employees
  - Settings
- Shared app state provider (`AppStateProvider`) for cross-module UI state
- Module-first folder boundaries under `app/modules/*`
- Placeholder screens for each tab

### Backend foundation
- NestJS modular structure
- Prisma configured with PostgreSQL datasource
- Core domain modules:
  - Managers
  - Employees
  - Shifts
  - ShiftAssignments
- Prisma schema with core entities:
  - `Manager`
  - `Employee`
  - `Shift`
  - `ShiftAssignment`

---

## Repository structure

```text
.
├── app/                           # React Native mobile app (Expo)
│   ├── app/                       # Expo Router routes
│   │   └── (tabs)/                # Tab navigation shell
│   ├── modules/                   # Feature/domain modules (PRD-aligned)
│   │   ├── home/
│   │   ├── calendar/
│   │   ├── employees/
│   │   └── settings/
│   └── shared/
│       └── state/                 # Shared app state provider(s)
└── backend/                       # NestJS API
    ├── src/
    │   ├── prisma/
    │   ├── managers/
    │   ├── employees/
    │   ├── shifts/
    │   └── shift-assignments/
    └── prisma/
        ├── schema.prisma
        └── migrations/
```

---

## Local development

### 1) Mobile app

```bash
cd app
npm install
npm run start
```

### 2) Backend

```bash
cd backend
npm install
cp .env.template .env
# set DATABASE_URL in .env
npm run prisma:format
npm run start:dev
```

### 3) Prisma migration workflow

```bash
cd backend
# create a new migration
npm run prisma:create -- <migration_name>

# deploy existing migrations
npm run prisma:apply
```

---

## Notes

This branch is intentionally focused on foundation and scaffolding so future PTO tickets can build on consistent module boundaries, navigation patterns, and stable core data models.
