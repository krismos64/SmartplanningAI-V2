-- CreateEnum
CREATE TYPE "IncidentNoteVisibility" AS ENUM ('DIRECTOR_ONLY', 'MANAGER_DIRECTOR', 'ALL');

-- CreateTable
CREATE TABLE "incident_notes" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visibility" "IncidentNoteVisibility" NOT NULL DEFAULT 'DIRECTOR_ONLY',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incident_notes_subjectId_idx" ON "incident_notes"("subjectId");

-- CreateIndex
CREATE INDEX "incident_notes_authorId_idx" ON "incident_notes"("authorId");

-- CreateIndex
CREATE INDEX "incident_notes_companyId_idx" ON "incident_notes"("companyId");

-- CreateIndex
CREATE INDEX "incident_notes_visibility_idx" ON "incident_notes"("visibility");

-- CreateIndex
CREATE INDEX "incident_notes_date_idx" ON "incident_notes"("date");

-- AddForeignKey
ALTER TABLE "incident_notes" ADD CONSTRAINT "incident_notes_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_notes" ADD CONSTRAINT "incident_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_notes" ADD CONSTRAINT "incident_notes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
