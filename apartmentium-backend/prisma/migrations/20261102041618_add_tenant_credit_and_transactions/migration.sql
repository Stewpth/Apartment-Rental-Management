-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('CREDIT_CREATED', 'CREDIT_APPLIED', 'REFUND');

-- CreateTable
CREATE TABLE "TenantCredit" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "tenantCreditId" TEXT NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentId" TEXT,
    "monthlyDueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantCredit_rentalId_key" ON "TenantCredit"("rentalId");

-- CreateIndex
CREATE INDEX "CreditTransaction_tenantCreditId_idx" ON "CreditTransaction"("tenantCreditId");

-- CreateIndex
CREATE INDEX "CreditTransaction_type_idx" ON "CreditTransaction"("type");

-- CreateIndex
CREATE INDEX "CreditTransaction_paymentId_idx" ON "CreditTransaction"("paymentId");

-- CreateIndex
CREATE INDEX "CreditTransaction_monthlyDueId_idx" ON "CreditTransaction"("monthlyDueId");

-- AddForeignKey
ALTER TABLE "TenantCredit" ADD CONSTRAINT "TenantCredit_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_tenantCreditId_fkey" FOREIGN KEY ("tenantCreditId") REFERENCES "TenantCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_monthlyDueId_fkey" FOREIGN KEY ("monthlyDueId") REFERENCES "MonthlyDue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
