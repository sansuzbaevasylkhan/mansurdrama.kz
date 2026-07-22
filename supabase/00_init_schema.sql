-- ============================================
-- MansurDrama.kz — Database Schema (Supabase)
-- ============================================
-- Бұл файл Supabase SQL Editor-да қолмен орындалады.
-- Vercel build environment-та prisma db push ENOTFOUND қатесін
-- береді, сондықтан SQL скрипт қолмен іске қосылады.
--
-- Қолдану:
--   1) Supabase Dashboard → SQL Editor → New Query
--   2) Осы файлдың толық мазмұнын қойыңыз
--   3) RUN басыңыз (Ctrl+Enter)
--   4) "Success" хабарламасын күтіңіз
--
-- Қайта іске қосу қажет болса (enum/table already exists қатесі):
--   DROP бөлімін бірінші орындаңыз, сосын CREATE бөлімін.
-- ============================================

-- =========================================
-- 1-ҚАДАМ: ТАЗАЛАУ (қажет болса)
-- =========================================
DROP TABLE IF EXISTS "UnlockedContent" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Episode" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Drama" CASCADE;
DROP TYPE IF EXISTS "PaymentType" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;

-- =========================================
-- 2-ҚАДАМ: СХЕМА ЖАСАУ
-- =========================================

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SINGLE_EPISODE', 'FULL_PACKAGE');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable: Drama
CREATE TABLE "Drama" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "posterUrl" TEXT NOT NULL,
    "totalEpisodes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Drama_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Episode
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dramaId" TEXT NOT NULL,
    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Payment
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dramaId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "episodeNumber" INTEGER,
    "receiptUrl" TEXT NOT NULL,
    "kaspiNumber" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UnlockedContent
CREATE TABLE "UnlockedContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dramaId" TEXT NOT NULL,
    "episodeNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnlockedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "password" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drama_slug_key" ON "Drama"("slug");
CREATE INDEX "Drama_slug_idx" ON "Drama"("slug");
CREATE INDEX "Drama_createdAt_idx" ON "Drama"("createdAt");
CREATE INDEX "Drama_isPublished_idx" ON "Drama"("isPublished");
CREATE INDEX "Episode_dramaId_idx" ON "Episode"("dramaId");
CREATE UNIQUE INDEX "Episode_dramaId_episodeNumber_key" ON "Episode"("dramaId", "episodeNumber");
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_dramaId_idx" ON "Payment"("dramaId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "UnlockedContent_dramaId_idx" ON "UnlockedContent"("dramaId");
CREATE UNIQUE INDEX "UnlockedContent_userId_dramaId_episodeNumber_key" ON "UnlockedContent"("userId", "dramaId", "episodeNumber");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnlockedContent" ADD CONSTRAINT "UnlockedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnlockedContent" ADD CONSTRAINT "UnlockedContent_dramaId_fkey" FOREIGN KEY ("dramaId") REFERENCES "Drama"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================
-- 3-ҚАДАМ: ТЕКСЕРУ
-- =========================================
SELECT
    table_name AS "Кесте",
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') AS "Бағандар саны"
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name IN ('Drama', 'Episode', 'User', 'Payment', 'UnlockedContent')
ORDER BY table_name;
