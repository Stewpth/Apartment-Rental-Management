-- CreateTable
CREATE TABLE "PendingTenantRegistration" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "unitId" TEXT NOT NULL,
    "moveInDate" DATE NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingTenantRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingTenantRegistration_email_key" ON "PendingTenantRegistration"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PendingTenantRegistration_username_key" ON "PendingTenantRegistration"("username");

-- CreateIndex
CREATE INDEX "PendingTenantRegistration_unitId_idx" ON "PendingTenantRegistration"("unitId");

-- CreateIndex
CREATE INDEX "PendingTenantRegistration_expiresAt_idx" ON "PendingTenantRegistration"("expiresAt");

-- AddForeignKey
ALTER TABLE "PendingTenantRegistration" ADD CONSTRAINT "PendingTenantRegistration_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
