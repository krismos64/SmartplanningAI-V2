-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "payments_status_createdAt_idx" ON "payments"("status", "createdAt" DESC);
