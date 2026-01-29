-- CreateTable
CREATE TABLE "personal_tasks" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personal_tasks_userId_idx" ON "personal_tasks"("userId");

-- CreateIndex
CREATE INDEX "personal_tasks_userId_completed_idx" ON "personal_tasks"("userId", "completed");

-- CreateIndex
CREATE INDEX "personal_tasks_userId_order_idx" ON "personal_tasks"("userId", "order");

-- AddForeignKey
ALTER TABLE "personal_tasks" ADD CONSTRAINT "personal_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
