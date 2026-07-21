-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dramaId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "episodeNumber" INTEGER,
    "receiptUrl" TEXT NOT NULL,
    "kaspiNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnlockedContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dramaId" TEXT NOT NULL,
    "episodeNumber" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnlockedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UnlockedContent_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_dramaId_idx" ON "Payment"("dramaId");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UnlockedContent_userId_dramaId_episodeNumber_key" ON "UnlockedContent"("userId", "dramaId", "episodeNumber");

-- CreateIndex
CREATE INDEX "UnlockedContent_userId_idx" ON "UnlockedContent"("userId");

-- CreateIndex
CREATE INDEX "UnlockedContent_dramaId_idx" ON "UnlockedContent"("dramaId");
