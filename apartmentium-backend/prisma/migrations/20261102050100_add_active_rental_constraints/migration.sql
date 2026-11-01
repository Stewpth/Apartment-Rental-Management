/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Announcement` table. All the data in the column will be lost.
  - Made the column `publishedAt` on table `Announcement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recordedById` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX IF EXISTS "Announcement_isPublished_publishedAt_idx";

-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "createdAt",
DROP COLUMN "isPublished",
ALTER COLUMN "publishedAt" SET NOT NULL,
ALTER COLUMN "publishedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "recordedById" SET NOT NULL;

-- CreateTable
CREATE TABLE "AccountActivation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountActivation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountActivation_userId_key" ON "AccountActivation"("userId");

-- AddForeignKey
ALTER TABLE "AccountActivation" ADD CONSTRAINT "AccountActivation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Rental_one_active_per_unit"
ON "Rental" ("unitId")
WHERE status IN ('ACTIVE', 'ON_LEAVING');

CREATE UNIQUE INDEX "Rental_one_active_per_tenant"
ON "Rental" ("tenantId")
WHERE status IN ('ACTIVE', 'ON_LEAVING');