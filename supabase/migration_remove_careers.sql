-- ============================================================================
-- MIGRATION: Remove the Careers feature completely
-- ============================================================================
-- Use this if you already ran schema.sql (with the old `careers` table)
-- and the Careers feature has now been removed from the app entirely —
-- no public Careers page, no admin "Manage Careers" panel.
--
-- This DROPS the `careers` table and all data in it. If you want to keep
-- a record of past job listings, export the table first (Table Editor >
-- careers > Export as CSV) before running this.
--
-- Run in: Supabase Dashboard > SQL Editor > New Query > paste this > Run
-- ============================================================================

drop table if exists public.careers cascade;

-- `cascade` also removes any policies attached to the table automatically,
-- so there's no separate "drop policy" step needed here.
