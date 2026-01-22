-- ============================================================================
-- Diagnostic Queries for Posts Not Fetching
-- ============================================================================
-- Run these queries in Supabase SQL Editor to diagnose the issue
-- ============================================================================

-- 1. Check if get_public_posts() function exists
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_public_posts';

-- 2. Check if there are any posts in the database
SELECT COUNT(*) as total_posts FROM public.posts;

-- 3. Check posts by status
SELECT status, COUNT(*) as count
FROM public.posts
GROUP BY status;

-- 4. Check if there are any approved posts
SELECT COUNT(*) as approved_posts
FROM public.posts
WHERE status = 'approved';

-- 5. Test the get_public_posts() function directly
SELECT * FROM get_public_posts() LIMIT 5;

-- 6. Check RLS policies on posts table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'posts';

-- 7. Check if function has proper grants
SELECT 
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name = 'get_public_posts';
