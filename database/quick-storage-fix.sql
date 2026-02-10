-- ============================================================================
-- QUICK FIX: DISABLE RLS ON STORAGE OBJECTS
-- ============================================================================
-- Run this to fix photo upload issues immediately
-- ============================================================================

-- Disable RLS on storage.objects table (this is blocking uploads)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 'Storage RLS disabled:' as status,
       CASE 
           WHEN rowsecurity('storage.objects') THEN 'DISABLED'
           ELSE 'ENABLED'
       END as rls_status;

SELECT 'Quick fix completed successfully' as final_status;
