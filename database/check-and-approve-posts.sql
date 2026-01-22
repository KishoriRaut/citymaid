-- ============================================================================
-- Check Posts and Approve for Testing
-- ============================================================================
-- Run this in Supabase SQL Editor to check posts and approve them
-- ============================================================================

-- 1. Check all posts and their status
SELECT 
    id,
    post_type,
    work,
    status,
    created_at
FROM public.posts
ORDER BY created_at DESC;

-- 2. Count posts by status
SELECT 
    status,
    COUNT(*) as count
FROM public.posts
GROUP BY status;

-- 3. Approve all pending posts (for testing)
-- Uncomment the line below to approve all pending posts:
-- UPDATE public.posts SET status = 'approved' WHERE status = 'pending';

-- 4. Approve a specific post (replace 'your-post-id' with actual ID)
-- UPDATE public.posts SET status = 'approved' WHERE id = 'your-post-id';

-- 5. Create a test approved post (if you have no posts)
-- Uncomment to create a test post:
/*
INSERT INTO public.posts (
    post_type, 
    work, 
    "time", 
    place, 
    salary, 
    contact, 
    status
) VALUES (
    'employer',
    'Need House Cleaner',
    'Day (9–5)',
    'Kathmandu',
    '5000',
    '9801234567',
    'approved'
) RETURNING *;
*/
