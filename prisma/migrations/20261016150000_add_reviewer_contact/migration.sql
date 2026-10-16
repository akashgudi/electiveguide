-- AlterTable
-- Nullable, no backfill: only pending reviews carry a reviewer name/email.
ALTER TABLE "Review" ADD COLUMN     "reviewerEmail" TEXT,
ADD COLUMN     "reviewerName" TEXT;
