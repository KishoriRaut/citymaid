-- ============================================================================
-- SIMPLE VERIFICATION - NO ROWSECURITY FUNCTION
-- ============================================================================
-- This script verifies the emergency fix without using problematic functions
-- ============================================================================

-- Check if RLS is disabled by looking at pg_tables
SELECT 'RLS Status Check:' as status,
       CASE 
           WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'public.posts') = false THEN 'DISABLED'
           ELSE 'ENABLED'
       END as rls_status,
       'Current posts count:' as count,
       COUNT(*) as post_count
FROM public.posts;

-- Check if emergency policy exists
SELECT 'Emergency Policy Status:' as status,
       EXISTS (
           SELECT 1 FROM pg_policies 
           WHERE tablename = 'posts' 
           AND policyname = 'Enable all access'
       )::int as policy_exists;

SELECT 'Verification complete' as final_status;
