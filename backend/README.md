# Employee Time Tracker Backend

NestJS backend for the manager-only employee scheduling app.

## Tech stack

- NestJS
- Prisma
- PostgreSQL

## Environment

Create `.env` from `.env.template` and set:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/employee_tracker
```

## Commands

```bash
npm install
npm run prisma:format
npm run start:dev
```

Useful:

```bash
npm run prisma:create -- init
npm run prisma:apply
npm run prisma:reset
```

## Data model (PRD-aligned)

- `Manager` (Google auth identity + company preferences)
- `Employee`
- `Shift`
- `ShiftAssignment` (includes `calculatedHours`)

## Notes

- Shift overlap prevention is an application-level validation rule (service/business logic).
- DB schema includes core relations and indexes for scheduling queries.
