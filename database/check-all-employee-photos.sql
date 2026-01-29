-- Check all employee posts to see if the photos are still there
-- The debug panel only shows 10 most recent posts

-- 1. Count all employee posts with photos
SELECT 
    COUNT(*) as total_employee_posts,
    COUNT(photo_url) as employee_posts_with_photos,
    COUNT(*) - COUNT(photo_url) as employee_posts_without_photos,
    'ALL_EMPLOYEE_POSTS' as scope
FROM public.posts 
WHERE post_type = 'employee';

-- 2. Show employee posts that DO have photos (should be 12 from our fix)
SELECT 
    id,
    work,
    status,
    photo_url,
    created_at,
    CASE 
        WHEN photo_url LIKE '%receipt-%' THEN 'STILL_HAS_RECEIPT'
        ELSE 'EMPLOYEE_PHOTO'
    END as photo_type
FROM public.posts 
WHERE post_type = 'employee'
AND photo_url IS NOT NULL
ORDER BY created_at DESC;

-- 3. Show the 10 most recent posts (what debug panel shows)
SELECT 
    id,
    work,
    status,
    photo_url,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as recent_rank
FROM public.posts 
WHERE post_type = 'employee'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if there are any employee posts with photos created in the last 24 hours
SELECT 
    COUNT(*) as recent_employee_posts_with_photos
FROM public.posts 
WHERE post_type = 'employee'
AND photo_url IS NOT NULL
AND created_at >= NOW() - INTERVAL '24 hours';

-- 5. Show the oldest employee posts with photos (to verify they still exist)
SELECT 
    id,
    work,
    status,
    photo_url,
    created_at
FROM public.posts 
WHERE post_type = 'employee'
AND photo_url IS NOT NULL
ORDER BY created_at ASC
LIMIT 5;
