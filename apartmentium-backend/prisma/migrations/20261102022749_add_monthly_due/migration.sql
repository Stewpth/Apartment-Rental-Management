-- CreateEnum
CREATE TYPE "MonthlyDueStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateTable
CREATE TABLE "MonthlyDue" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "billingPeriod" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "amountDue" DECIMAL(10,2) NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(10,2) NOT NULL,
    "status" "MonthlyDueStatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyDue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyDue_rentalId_idx" ON "MonthlyDue"("rentalId");

-- CreateIndex
CREATE INDEX "MonthlyDue_dueDate_idx" ON "MonthlyDue"("dueDate");

-- CreateIndex
CREATE INDEX "MonthlyDue_status_idx" ON "MonthlyDue"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyDue_rentalId_billingPeriod_key" ON "MonthlyDue"("rentalId", "billingPeriod");

-- AddForeignKey
ALTER TABLE "MonthlyDue" ADD CONSTRAINT "MonthlyDue_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
