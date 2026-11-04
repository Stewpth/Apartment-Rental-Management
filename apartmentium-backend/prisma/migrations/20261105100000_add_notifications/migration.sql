CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" VARCHAR(40) NOT NULL,
  "title" VARCHAR(120) NOT NULL,
  "message" TEXT NOT NULL,
  "link" VARCHAR(255),
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_userId_createdAt_idx"
ON "Notification"("userId", "createdAt");

CREATE INDEX "Notification_userId_readAt_idx"
ON "Notification"("userId", "readAt");

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
