-- CreateEnum
CREATE TYPE "AvailabilityType" AS ENUM ('UNAVAILABLE', 'PREFERRED', 'VACATION', 'SICK', 'TRAINING', 'OTHER');

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurrenceGroupId" TEXT,
ADD COLUMN     "recurrenceRule" JSONB,
ADD COLUMN     "scheduleGroupId" TEXT;

-- CreateTable
CREATE TABLE "availabilities" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "type" "AvailabilityType" NOT NULL DEFAULT 'UNAVAILABLE',
    "reason" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" JSONB,
    "employeeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "availabilities_employeeId_startDate_endDate_idx" ON "availabilities"("employeeId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "availabilities_companyId_idx" ON "availabilities"("companyId");

-- CreateIndex
CREATE INDEX "availabilities_type_idx" ON "availabilities"("type");

-- CreateIndex
CREATE INDEX "schedules_recurrenceGroupId_idx" ON "schedules"("recurrenceGroupId");

-- CreateIndex
CREATE INDEX "schedules_scheduleGroupId_idx" ON "schedules"("scheduleGroupId");

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
