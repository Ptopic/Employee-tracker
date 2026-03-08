-- AlterTable
ALTER TABLE "managers"
ADD COLUMN "picture" TEXT,
ADD COLUMN "refresh_token_hash" TEXT,
ADD COLUMN "refresh_token_expires_at" TIMESTAMP(3),
ADD COLUMN "token_version" INTEGER NOT NULL DEFAULT 0;
