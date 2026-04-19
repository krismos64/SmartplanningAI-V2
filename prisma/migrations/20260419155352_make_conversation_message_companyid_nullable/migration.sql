-- AlterTable
ALTER TABLE "conversations" ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "companyId" DROP NOT NULL;
