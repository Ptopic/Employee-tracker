-- Make employee age optional
ALTER TABLE "employees"
ALTER COLUMN "age" DROP NOT NULL;
