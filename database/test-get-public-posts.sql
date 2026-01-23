-- ============================================================================
-- Test Script: Verify get_public_posts() function is working
-- ============================================================================
-- Run this to check if the function exists and returns approved posts correctly
-- ============================================================================

-- 1. Check if function exists
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_public_posts';

-- 2. Check current posts and their status
SELECT 
    id,
    post_type,
    work,
    status,
    created_at,
    CASE 
        WHEN created_at >= now() - interval '30 days' THEN 'Within 30 days'
        ELSE 'Older than 30 days'
    END as expiration_status
FROM public.posts
ORDER BY created_at DESC
LIMIT 10;

-- 3. Test the function directly
SELECT * FROM get_public_posts() LIMIT 10;

-- 4. Count approved posts that should be visible
SELECT 
    COUNT(*) as total_approved_posts,
    COUNT(CASE WHEN created_at >= now() - interval '30 days' THEN 1 END) as visible_posts
FROM public.posts
WHERE status = 'approved';

-- 5. Check if there are any pending posts that need approval
SELECT 
    COUNT(*) as pending_posts,
    COUNT(CASE WHEN post_type = 'employer' THEN 1 END) as pending_employer,
    COUNT(CASE WHEN post_type = 'employee' THEN 1 END) as pending_employee
FROM public.posts
WHERE status = 'pending';
