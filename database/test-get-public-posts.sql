-- ============================================================================
-- Quick Test for get_public_posts() Function
-- ============================================================================
-- Run this in Supabase SQL Editor to test if the function works
-- ============================================================================

-- Test 1: Check if function exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = 'get_public_posts'
) AS function_exists;

-- Test 2: Try calling the function
SELECT * FROM get_public_posts() LIMIT 5;

-- Test 3: Check if there are any approved posts
SELECT 
    COUNT(*) as total_posts,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_posts,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_posts
FROM public.posts;

-- Test 4: If no approved posts, create a test one (uncomment to use)
/*
INSERT INTO public.posts (post_type, work, "time", place, salary, contact, status)
VALUES ('employer', 'Test Job', '9am-5pm', 'Kathmandu', '5000', '9801234567', 'approved')
RETURNING id, work, status;
*/

-- Test 5: Check function permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name = 'get_public_posts';
