-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "emailStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "emailError" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "contact_messages_isRead_createdAt_idx" ON "contact_messages"("isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "contact_messages_emailStatus_idx" ON "contact_messages"("emailStatus");
