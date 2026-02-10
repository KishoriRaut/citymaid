-- ============================================================================
-- DIAGNOSTIC: CHECK CURRENT RLS POLICIES
-- ============================================================================
-- Run this to see what RLS policies are currently active
-- ============================================================================

-- Check posts table policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;

-- Check if any policies exist for posts table
SELECT 'Posts RLS policies count: ' || COUNT(*) || ' policies found' as status
FROM pg_policies 
WHERE tablename = 'posts';

-- Check if posts table has RLS enabled
SELECT 'Posts RLS enabled: ' || rowsecurity::has_row_security('public.posts') as status;

-- Check current user in posts table (should return 0 for public access)
SELECT COUNT(*) as post_count
FROM public.posts 
LIMIT 5;

SELECT 'Diagnostic complete' as status;
