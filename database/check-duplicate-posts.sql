-- Check what posts exist that might be causing duplicate detection
-- Run this in your production Supabase SQL Editor

-- Check posts with same contact info that might be blocking new posts
SELECT 
    id,
    contact,
    post_type,
    work,
    place,
    status,
    created_at
FROM public.posts 
WHERE status IN ('pending', 'approved', 'hidden')
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are any posts at all
SELECT COUNT(*) as total_posts FROM public.posts;

-- Check posts by status
SELECT status, COUNT(*) as count 
FROM public.posts 
GROUP BY status
ORDER BY status;
