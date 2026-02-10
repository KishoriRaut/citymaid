-- ============================================================================
-- Final Cleanup Script - Remove Unused Tables
-- ============================================================================
-- Run this script in your Supabase SQL Editor
-- This removes tables that are not used by the application
-- ============================================================================

-- Drop unused/duplicate tables
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.payment_audit_log CASCADE;
DROP TABLE IF EXISTS public.security_logs CASCADE;

-- ============================================================================
-- VERIFICATION (Optional - uncomment to check remaining tables)
-- ============================================================================
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- ============================================================================
-- CLEANUP COMPLETE
-- ============================================================================
-- Remaining tables (all actively used):
-- - posts (job postings)
-- - payments (payment records)
-- - contact_unlock_requests (contact unlock requests)
-- - users (admin authentication)
-- - profiles (user profiles for dashboard)
-- ============================================================================
