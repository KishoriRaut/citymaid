-- ============================================================================
-- Diagnostic: Check why approved posts aren't showing on homepage
-- ============================================================================
-- Run this to identify the issue
-- ============================================================================

-- 1. Check if function exists and has correct permissions
SELECT 
    routine_name,
    routine_type,
    security_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_public_posts';

-- 2. Test the function directly
SELECT 
    id,
    work,
    status,
    created_at,
    CASE 
        WHEN created_at >= now() - interval '30 days' THEN 'Within 30 days - SHOULD SHOW'
        ELSE 'Older than 30 days - WILL NOT SHOW'
    END as visibility_status
FROM get_public_posts()
ORDER BY created_at DESC
LIMIT 20;

-- 3. Check all approved posts and their age
SELECT 
    id,
    work,
    status,
    created_at,
    now() - created_at as age,
    CASE 
        WHEN created_at >= now() - interval '30 days' THEN 'Visible'
        ELSE 'Hidden (older than 30 days)'
    END as should_be_visible
FROM public.posts
WHERE status = 'approved'
ORDER BY created_at DESC;

-- 4. Count posts by status and visibility
SELECT 
    status,
    COUNT(*) as total,
    COUNT(CASE WHEN created_at >= now() - interval '30 days' THEN 1 END) as visible_count,
    COUNT(CASE WHEN created_at < now() - interval '30 days' THEN 1 END) as hidden_by_age
FROM public.posts
GROUP BY status;

-- 5. Check if there are any RLS policy issues
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
