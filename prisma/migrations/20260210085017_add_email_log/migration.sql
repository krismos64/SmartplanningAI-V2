-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "emailType" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "metadata" JSONB,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_logs_companyId_idx" ON "email_logs"("companyId");

-- CreateIndex
CREATE INDEX "email_logs_emailType_sentAt_idx" ON "email_logs"("emailType", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_subscriptionId_emailType_key" ON "email_logs"("subscriptionId", "emailType");

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
