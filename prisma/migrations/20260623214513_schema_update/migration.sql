/*
  Warnings:

  - You are about to drop the `Candidate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `appliedAt` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `candidateId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `resumeUrl` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `salaryRange` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Job` table. All the data in the column will be lost.
  - Added the required column `applicantId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchScore` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requiredSkills` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Candidate_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Candidate";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "skills" JSONB NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Applied',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicantId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("createdAt", "id", "jobId", "updatedAt") SELECT "createdAt", "id", "jobId", "updatedAt" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE UNIQUE INDEX "Application_jobId_applicantId_key" ON "Application"("jobId", "applicantId");
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredSkills" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Job" ("createdAt", "description", "id", "title", "updatedAt") SELECT "createdAt", "description", "id", "title", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_email_key" ON "Applicant"("email");
