-- ============================================================================
-- Cleanup Unused Tables Script
-- ============================================================================
-- Run this script in your Supabase SQL Editor
-- This removes the unused contact_submissions table and its dependencies
-- ============================================================================

-- Drop the unused contact_submissions table and all its dependencies
-- This will cascade and drop all related objects (views, functions, triggers)

-- 1. Drop the admin view first
DROP VIEW IF EXISTS public.contact_submissions_admin;

-- 2. Drop the associated functions
DROP FUNCTION IF EXISTS public.get_contact_submissions(INTEGER, INTEGER, VARCHAR, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS public.insert_contact_submission(VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, TEXT, INET, VARCHAR);
DROP FUNCTION IF EXISTS public.update_contact_status(UUID, VARCHAR, TEXT);

-- 3. Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON public.contact_submissions;

-- 4. Drop the main table
DROP TABLE IF EXISTS public.contact_submissions CASCADE;

-- 5. Verify cleanup (optional - uncomment to check)
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name = 'contact_submissions';

-- ============================================================================
-- CLEANUP COMPLETE
-- ============================================================================
-- The following tables remain in use:
-- - posts (job postings)
-- - payments (payment records)
-- - contact_unlock_requests (contact unlock requests)
-- - users (admin authentication)
--
-- Storage buckets remain:
-- - post-photos (image uploads)
-- - payment-proofs (payment receipts)
-- ============================================================================
