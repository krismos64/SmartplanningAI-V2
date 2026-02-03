-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PLANNING';
ALTER TYPE "NotificationType" ADD VALUE 'LEAVE';
ALTER TYPE "NotificationType" ADD VALUE 'TASK';
ALTER TYPE "NotificationType" ADD VALUE 'INCIDENT';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM';

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");
