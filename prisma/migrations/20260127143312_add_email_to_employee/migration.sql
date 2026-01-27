-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "schedules" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';
