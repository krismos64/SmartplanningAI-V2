-- AlterEnum: Remove CANCELLED and COMPLETED from ScheduleStatus
-- First update any existing rows
UPDATE "schedules" SET "status" = 'CONFIRMED' WHERE "status" IN ('CANCELLED', 'COMPLETED');

-- Recreate enum without CANCELLED/COMPLETED
ALTER TYPE "ScheduleStatus" RENAME TO "ScheduleStatus_old";
CREATE TYPE "ScheduleStatus" AS ENUM ('DRAFT', 'CONFIRMED');
ALTER TABLE "schedules" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "schedules" ALTER COLUMN "status" TYPE "ScheduleStatus" USING ("status"::text::"ScheduleStatus");
ALTER TABLE "schedules" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
DROP TYPE "ScheduleStatus_old";
