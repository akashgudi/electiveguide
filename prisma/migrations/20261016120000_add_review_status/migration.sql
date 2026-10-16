-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('Pending', 'Approved', 'Denied');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'Pending';

-- CreateIndex
CREATE INDEX "Review_status_createdAt_idx" ON "Review"("status", "createdAt");

-- Backfill: everything already in the table was live before moderation existed,
-- so it's Approved; reviews that had been archived count as Denied.
UPDATE "Review" SET "status" = 'Approved' WHERE "archivedAt" IS NULL;
UPDATE "Review" SET "status" = 'Denied' WHERE "archivedAt" IS NOT NULL;
