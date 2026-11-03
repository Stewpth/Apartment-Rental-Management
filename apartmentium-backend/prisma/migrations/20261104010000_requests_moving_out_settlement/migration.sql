  -- Non-destructive request lifecycle and move-out settlement additions.
  ALTER TYPE "RequestCategory" ADD VALUE 'MOVING_OUT';
  ALTER TYPE "RequestStatus" RENAME VALUE 'NOT_RESOLVED' TO 'PENDING';
  ALTER TYPE "RequestStatus" ADD VALUE 'REJECTED';

  ALTER TABLE "TenantRequest"
    ADD COLUMN "title" VARCHAR(120) NOT NULL DEFAULT 'Request',
    ADD COLUMN "requestedMoveOutDate" DATE,
    ADD COLUMN "reason" VARCHAR(500),
    ADD COLUMN "priority" VARCHAR(20),
    ADD COLUMN "adminNotes" TEXT;
  UPDATE "TenantRequest" SET "title" = LEFT("description", 120);
  ALTER TABLE "TenantRequest" ALTER COLUMN "title" DROP DEFAULT;
  CREATE INDEX "TenantRequest_rentalId_category_status_idx" ON "TenantRequest"("rentalId", "category", "status");
  CREATE UNIQUE INDEX "TenantRequest_one_active_moving_out_per_rental_key" ON "TenantRequest"("rentalId") WHERE "category" = 'MOVING_OUT' AND "status" IN ('PENDING', 'IN_PROGRESS');

  CREATE TABLE "FinalSettlement" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "confirmedById" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unpaidDues" DECIMAL(10,2) NOT NULL,
    "unusedRentCredit" DECIMAL(10,2) NOT NULL,
    "existingTenantCredit" DECIMAL(10,2) NOT NULL,
    "tenantCreditRefund" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "approvedCharges" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "creditsApplied" DECIMAL(10,2) NOT NULL,
    "originalBalance" DECIMAL(10,2) NOT NULL,
    "amountOwed" DECIMAL(10,2) NOT NULL,
    "refundDue" DECIMAL(10,2) NOT NULL,
    CONSTRAINT "FinalSettlement_pkey" PRIMARY KEY ("id")
  );
  CREATE UNIQUE INDEX "FinalSettlement_rentalId_key" ON "FinalSettlement"("rentalId");
  CREATE UNIQUE INDEX "FinalSettlement_requestId_key" ON "FinalSettlement"("requestId");
  CREATE INDEX "FinalSettlement_confirmedAt_idx" ON "FinalSettlement"("confirmedAt");
  ALTER TABLE "FinalSettlement" ADD CONSTRAINT "FinalSettlement_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  ALTER TABLE "FinalSettlement" ADD CONSTRAINT "FinalSettlement_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TenantRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  ALTER TABLE "FinalSettlement" ADD CONSTRAINT "FinalSettlement_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

  CREATE TABLE "SettlementAdjustment" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SettlementAdjustment_pkey" PRIMARY KEY ("id")
  );
  CREATE INDEX "SettlementAdjustment_settlementId_createdAt_idx" ON "SettlementAdjustment"("settlementId", "createdAt");
  ALTER TABLE "SettlementAdjustment" ADD CONSTRAINT "SettlementAdjustment_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "FinalSettlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  ALTER TABLE "SettlementAdjustment" ADD CONSTRAINT "SettlementAdjustment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

  CREATE TABLE "SettlementRefund" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT NOT NULL,
    "note" VARCHAR(500),
    CONSTRAINT "SettlementRefund_pkey" PRIMARY KEY ("id")
  );
  CREATE INDEX "SettlementRefund_settlementId_processedAt_idx" ON "SettlementRefund"("settlementId", "processedAt");
  ALTER TABLE "SettlementRefund" ADD CONSTRAINT "SettlementRefund_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "FinalSettlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  ALTER TABLE "SettlementRefund" ADD CONSTRAINT "SettlementRefund_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

  CREATE TABLE "SettlementDueSnapshot" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "monthlyDueId" TEXT NOT NULL,
    "billingPeriod" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "amountDue" DECIMAL(10,2) NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL,
    CONSTRAINT "SettlementDueSnapshot_pkey" PRIMARY KEY ("id")
  );
  CREATE UNIQUE INDEX "SettlementDueSnapshot_settlementId_monthlyDueId_key" ON "SettlementDueSnapshot"("settlementId", "monthlyDueId");
  CREATE INDEX "SettlementDueSnapshot_settlementId_billingPeriod_idx" ON "SettlementDueSnapshot"("settlementId", "billingPeriod");
  ALTER TABLE "SettlementDueSnapshot" ADD CONSTRAINT "SettlementDueSnapshot_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "FinalSettlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  ALTER TABLE "SettlementDueSnapshot" ADD CONSTRAINT "SettlementDueSnapshot_monthlyDueId_fkey" FOREIGN KEY ("monthlyDueId") REFERENCES "MonthlyDue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

  CREATE FUNCTION prevent_financial_history_change() RETURNS trigger AS $$
  BEGIN
    RAISE EXCEPTION 'Financial settlement history is immutable; append an adjustment or refund record.' USING ERRCODE = '55000';
  END;
  $$ LANGUAGE plpgsql;
  CREATE TRIGGER "FinalSettlement_immutable" BEFORE UPDATE OR DELETE ON "FinalSettlement" FOR EACH ROW EXECUTE FUNCTION prevent_financial_history_change();
  CREATE TRIGGER "SettlementDueSnapshot_immutable" BEFORE UPDATE OR DELETE ON "SettlementDueSnapshot" FOR EACH ROW EXECUTE FUNCTION prevent_financial_history_change();
  CREATE TRIGGER "SettlementAdjustment_immutable" BEFORE UPDATE OR DELETE ON "SettlementAdjustment" FOR EACH ROW EXECUTE FUNCTION prevent_financial_history_change();
  CREATE TRIGGER "SettlementRefund_immutable" BEFORE UPDATE OR DELETE ON "SettlementRefund" FOR EACH ROW EXECUTE FUNCTION prevent_financial_history_change();
