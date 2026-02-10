-- ============================================================================
-- VERIFICATION: CHECK IF EMERGENCY FIX WAS APPLIED
-- ============================================================================
-- This script verifies if the RLS disabling was successful
-- ============================================================================

-- Check if RLS is actually disabled
SELECT 'RLS Status Check:' as status,
       CASE 
           WHEN rowsecurity('public.posts') THEN 'ENABLED'
           ELSE 'DISABLED'
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
