-- ============================================================================
-- SECURITY UPDATE: RLS (Row Level Security) Implementation
-- This script enables RLS on all tables and defines access policies.
-- IMPORTANT: Run this in Supabase SQL Editor.
-- ============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Drama" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Episode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UnlockedContent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WatchHistory" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. POLICIES FOR "User" TABLE
-- ============================================================================
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON "User" FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON "User" FOR UPDATE
USING (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins have full access to users"
ON "User" FOR ALL
USING (
  (SELECT role FROM "User" WHERE id = auth.uid()) = 'ADMIN'
);

-- ============================================================================
-- 3. POLICIES FOR "Drama" AND "Episode" (Public Read)
-- ============================================================================
-- Everyone can view dramas and episodes
CREATE POLICY "Dramas are public"
ON "Drama" FOR SELECT
USING (true);

CREATE POLICY "Episodes are public"
ON "Episode" FOR SELECT
USING (true);

-- Only admins can modify dramas/episodes
CREATE POLICY "Only admins can modify dramas"
ON "Drama" FOR ALL
USING ((SELECT role FROM "User" WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Only admins can modify episodes"
ON "Episode" FOR ALL
USING ((SELECT role FROM "User" WHERE id = auth.uid()) = 'ADMIN');

-- ============================================================================
-- 4. POLICIES FOR "Payment" AND "UnlockedContent"
-- ============================================================================
-- Users can view their own payments and unlocked content
CREATE POLICY "Users can view their own payments"
ON "Payment" FOR SELECT
USING (auth.uid() = "userId");

CREATE POLICY "Users can view their own unlocked content"
ON "UnlockedContent" FOR SELECT
USING (auth.uid() = "userId");

-- Admins can view and manage all payments/unlocks
CREATE POLICY "Admins can manage all payments"
ON "Payment" FOR ALL
USING ((SELECT role FROM "User" WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can manage all unlocked content"
ON "UnlockedContent" FOR ALL
USING ((SELECT role FROM "User" WHERE id = auth.uid()) = 'ADMIN');

-- ============================================================================
-- 5. POLICIES FOR "WatchHistory"
-- ============================================================================
-- Users can view and update their own watch history
CREATE POLICY "Users can manage their own watch history"
ON "WatchHistory" FOR ALL
USING (auth.uid() = "userId");

-- Admins can view all watch history
CREATE POLICY "Admins can view all watch history"
ON "WatchHistory" FOR SELECT
USING ((SELECT role FROM "User" WHERE id = auth.uid()) = 'ADMIN');
