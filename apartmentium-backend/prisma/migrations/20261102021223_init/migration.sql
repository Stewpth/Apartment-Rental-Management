-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TENANT');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_ACTIVATION', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('AVAILABLE', 'OCCUPIED');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('ACTIVE', 'ON_LEAVING', 'ENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "profileImage" TEXT,
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_ACTIVATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "description" TEXT,
    "monthlyRent" DECIMAL(10,2) NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "monthlyRent" DECIMAL(10,2) NOT NULL,
    "moveInDate" DATE NOT NULL,
    "leavingRequestedAt" TIMESTAMP(3),
    "actualMoveOutDate" DATE,
    "status" "RentalStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_unitNumber_key" ON "Unit"("unitNumber");

-- CreateIndex
CREATE INDEX "Unit_status_idx" ON "Unit"("status");

-- CreateIndex
CREATE INDEX "Rental_tenantId_idx" ON "Rental"("tenantId");

-- CreateIndex
CREATE INDEX "Rental_unitId_idx" ON "Rental"("unitId");

-- CreateIndex
CREATE INDEX "Rental_status_idx" ON "Rental"("status");

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
