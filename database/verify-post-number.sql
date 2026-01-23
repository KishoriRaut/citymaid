-- ============================================================================
-- Verify: Check if post_number column exists and is populated
-- ============================================================================
-- Run this to check if the migration was successful
-- ============================================================================

-- 1. Check if column exists
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'posts'
  AND column_name = 'post_number';

-- 2. Check if posts have post_number values
SELECT 
    id,
    post_number,
    work,
    status,
    created_at
FROM public.posts
ORDER BY post_number NULLS LAST
LIMIT 10;

-- 3. Check if function returns post_number
SELECT 
    id,
    post_number,
    work,
    status
FROM get_public_posts()
LIMIT 5;

-- 4. Count posts with and without post_number
SELECT 
    COUNT(*) as total_posts,
    COUNT(post_number) as posts_with_number,
    COUNT(*) - COUNT(post_number) as posts_without_number
FROM public.posts;
