# saveit

Monorepo for the manager-only employee time management app.

## Current setup (PTO-257)

This branch establishes the project foundation:

- Backend Prisma schema aligned to PRD core entities:
  - `Manager`
  - `Employee`
  - `Shift`
  - `ShiftAssignment`
- Mobile app identity normalized to saveit values.
- Router stack cleaned to only include currently available routes.

## Repository structure

- `app/` → Expo React Native application (iOS/Android)
- `backend/` → NestJS + Prisma API
- `ARCHITECTURE.md` → PRD architecture and folder-structure reference (PTO-229)

## Run locally

### App

```bash
cd app
npm install
npm run start
```

### Backend

```bash
cd backend
npm install
cp .env.template .env
# set DATABASE_URL in .env
npm run prisma:format
npm run start:dev
```

## Next implementation order

1. Setup & foundation (this branch)
2. Authentication
3. Calendar & shift management
4. Employee management
5. Home dashboard
6. PDF export
7. Settings
8. Quality/performance/security hardening
