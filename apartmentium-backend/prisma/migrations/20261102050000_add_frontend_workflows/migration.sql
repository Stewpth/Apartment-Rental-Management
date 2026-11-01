-- Align the account/profile split with the existing user and rental records.
ALTER TYPE "UserRole" RENAME TO "Role";
ALTER TYPE "UnitStatus" ADD VALUE 'MAINTENANCE';

ALTER TABLE "User" RENAME COLUMN "passwordHash" TO "passwordHashed";

CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

INSERT INTO "UserProfile" ("id", "userId", "fullName", "phone", "profileImageUrl", "updatedAt")
SELECT gen_random_uuid()::text, "id", "fullName", "phone", "profileImage", CURRENT_TIMESTAMP
FROM "User";

CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Tenant" ("id", "userId", "updatedAt")
SELECT "id", "id", CURRENT_TIMESTAMP
FROM "User"
WHERE "role" = 'TENANT';

ALTER TABLE "Rental" DROP CONSTRAINT "Rental_tenantId_fkey";
ALTER TABLE "Rental" RENAME COLUMN "actualMoveOutDate" TO "endDate";
ALTER TABLE "Unit" RENAME COLUMN "monthlyRent" TO "unitPrice";

ALTER TABLE "User" DROP COLUMN "fullName";
ALTER TABLE "User" DROP COLUMN "phone";
ALTER TABLE "User" DROP COLUMN "profileImage";

CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
CREATE UNIQUE INDEX "Tenant_userId_key" ON "Tenant"("userId");

ALTER TABLE "UserProfile"
ADD CONSTRAINT "UserProfile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Tenant"
ADD CONSTRAINT "Tenant_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Rental"
ADD CONSTRAINT "Rental_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
ADD COLUMN "reference" TEXT,
ADD COLUMN "note" VARCHAR(50),
ADD COLUMN "recordedById" TEXT;

ALTER TABLE "CreditTransaction"
ADD COLUMN "recordedById" TEXT;

CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");
CREATE INDEX "Payment_recordedById_idx" ON "Payment"("recordedById");
CREATE INDEX "CreditTransaction_recordedById_idx" ON "CreditTransaction"("recordedById");

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_recordedById_fkey"
FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CreditTransaction"
ADD CONSTRAINT "CreditTransaction_recordedById_fkey"
FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TYPE "RequestCategory" AS ENUM ('REPAIR', 'PERMISSION', 'COMPLAINT');
CREATE TYPE "RequestStatus" AS ENUM ('NOT_RESOLVED', 'IN_PROGRESS', 'RESOLVED');

CREATE TABLE "TenantRequest" (
    "id" TEXT NOT NULL,
    "reference" TEXT,
    "rentalId" TEXT NOT NULL,
    "category" "RequestCategory" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NOT_RESOLVED',
    "description" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "TenantRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RequestAttachment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestAttachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RequestUpdate" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "status" "RequestStatus",
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestUpdate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "content" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnnouncementRead" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TenantRequest_rentalId_createdAt_idx" ON "TenantRequest"("rentalId", "createdAt");
CREATE INDEX "TenantRequest_status_createdAt_idx" ON "TenantRequest"("status", "createdAt");
CREATE INDEX "TenantRequest_category_idx" ON "TenantRequest"("category");
CREATE UNIQUE INDEX "TenantRequest_reference_key" ON "TenantRequest"("reference");
CREATE INDEX "RequestAttachment_requestId_idx" ON "RequestAttachment"("requestId");
CREATE INDEX "RequestUpdate_requestId_createdAt_idx" ON "RequestUpdate"("requestId", "createdAt");
CREATE INDEX "RequestUpdate_authorId_idx" ON "RequestUpdate"("authorId");
CREATE INDEX "Announcement_isPublished_publishedAt_idx" ON "Announcement"("isPublished", "publishedAt");
CREATE INDEX "Announcement_authorId_idx" ON "Announcement"("authorId");
CREATE UNIQUE INDEX "AnnouncementRead_announcementId_userId_key" ON "AnnouncementRead"("announcementId", "userId");
CREATE INDEX "AnnouncementRead_userId_readAt_idx" ON "AnnouncementRead"("userId", "readAt");

ALTER TABLE "TenantRequest"
ADD CONSTRAINT "TenantRequest_rentalId_fkey"
FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RequestAttachment"
ADD CONSTRAINT "RequestAttachment_requestId_fkey"
FOREIGN KEY ("requestId") REFERENCES "TenantRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RequestUpdate"
ADD CONSTRAINT "RequestUpdate_requestId_fkey"
FOREIGN KEY ("requestId") REFERENCES "TenantRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT "RequestUpdate_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Announcement"
ADD CONSTRAINT "Announcement_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AnnouncementRead"
ADD CONSTRAINT "AnnouncementRead_announcementId_fkey"
FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT "AnnouncementRead_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
