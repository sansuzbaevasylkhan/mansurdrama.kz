-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EpisodeStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Drama" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "posterUrl" TEXT NOT NULL,
    "totalEpisodes" INTEGER NOT NULL DEFAULT 0,
    "freeEpisodesCount" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drama_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "playbackId" TEXT,
    "muxAssetId" TEXT,
    "muxUploadId" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "status" "EpisodeStatus" NOT NULL DEFAULT 'PUBLISHED',
    "publishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dramaId" TEXT NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dramaId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "positionSeconds" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "banner" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "notifyNewEpisodes" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "freeEndedNotifiedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "adminComment" TEXT,
    "manuallyRefunded" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSetting" (
    "userId" TEXT NOT NULL,
    "payments" BOOLEAN NOT NULL DEFAULT true,
    "newEpisodes" BOOLEAN NOT NULL DEFAULT true,
    "promos" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationSetting_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "dramaId" TEXT NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId","dramaId")
);

-- CreateTable
CREATE TABLE "WatchProgress" (
    "userId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "dramaId" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchProgress_pkey" PRIMARY KEY ("userId","episodeId")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "latestVersion" TEXT NOT NULL,
    "minimumSupportedVersion" TEXT NOT NULL,
    "forceUpdate" BOOLEAN NOT NULL DEFAULT false,
    "storeUrl" TEXT NOT NULL,
    "message" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tariff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "validUntil" TIMESTAMP(3),
    "paymentPhone" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dramaId" TEXT NOT NULL,
    "tariffId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "episodeNumber" INTEGER,
    "receiptPdfUrl" TEXT NOT NULL,
    "receiptHash" TEXT,
    "kaspiNumber" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "rejectReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TariffDrama" (
    "tariffId" TEXT NOT NULL,
    "dramaId" TEXT NOT NULL,

    CONSTRAINT "TariffDrama_pkey" PRIMARY KEY ("tariffId","dramaId")
);

-- CreateTable
CREATE TABLE "UnlockedContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dramaId" TEXT NOT NULL,
    "episodeNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnlockedContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drama_slug_key" ON "Drama"("slug");

-- CreateIndex
CREATE INDEX "Drama_slug_idx" ON "Drama"("slug");

-- CreateIndex
CREATE INDEX "Drama_createdAt_idx" ON "Drama"("createdAt");

-- CreateIndex
CREATE INDEX "Drama_isPublished_idx" ON "Drama"("isPublished");

-- CreateIndex
CREATE INDEX "Episode_dramaId_idx" ON "Episode"("dramaId");

-- CreateIndex
CREATE INDEX "Episode_status_idx" ON "Episode"("status");

-- CreateIndex
CREATE INDEX "Episode_status_publishAt_idx" ON "Episode"("status", "publishAt");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_dramaId_episodeNumber_key" ON "Episode"("dramaId", "episodeNumber");

-- CreateIndex
CREATE INDEX "WatchHistory_userId_updatedAt_idx" ON "WatchHistory"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "WatchHistory_dramaId_idx" ON "WatchHistory"("dramaId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchHistory_userId_episodeId_key" ON "WatchHistory"("userId", "episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRequest_paymentId_key" ON "RefundRequest"("paymentId");

-- CreateIndex
CREATE INDEX "RefundRequest_userId_idx" ON "RefundRequest"("userId");

-- CreateIndex
CREATE INDEX "RefundRequest_status_idx" ON "RefundRequest"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");

-- CreateIndex
CREATE INDEX "PushToken_token_idx" ON "PushToken"("token");

-- CreateIndex
CREATE INDEX "PushToken_userId_idx" ON "PushToken"("userId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_dramaId_idx" ON "Favorite"("dramaId");

-- CreateIndex
CREATE INDEX "WatchProgress_userId_idx" ON "WatchProgress"("userId");

-- CreateIndex
CREATE INDEX "WatchProgress_dramaId_idx" ON "WatchProgress"("dramaId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_dramaId_idx" ON "Payment"("dramaId");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "TariffDrama_dramaId_idx" ON "TariffDrama"("dramaId");

-- CreateIndex
CREATE INDEX "UnlockedContent_userId_idx" ON "UnlockedContent"("userId");

-- CreateIndex
CREATE INDEX "UnlockedContent_dramaId_idx" ON "UnlockedContent"("dramaId");

-- CreateIndex
CREATE UNIQUE INDEX "UnlockedContent_userId_dramaId_episodeNumber_key" ON "UnlockedContent"("userId", "dramaId", "episodeNumber");

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSetting" ADD CONSTRAINT "NotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchProgress" ADD CONSTRAINT "WatchProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchProgress" ADD CONSTRAINT "WatchProgress_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchProgress" ADD CONSTRAINT "WatchProgress_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "Tariff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TariffDrama" ADD CONSTRAINT "TariffDrama_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "Tariff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TariffDrama" ADD CONSTRAINT "TariffDrama_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockedContent" ADD CONSTRAINT "UnlockedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockedContent" ADD CONSTRAINT "UnlockedContent_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama"("id") ON DELETE CASCADE ON UPDATE CASCADE;
