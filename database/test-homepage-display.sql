-- Test what the homepage should actually display
-- This simulates the get_public_posts() RPC function

-- 1. Test the exact RPC function the homepage uses
SELECT 
    id,
    post_type,
    work,
    photo_url,
    status,
    created_at,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'Has Photo'
        ELSE 'No Photo'
    END as photo_status
FROM get_public_posts()
WHERE post_type = 'employee'
ORDER BY created_at DESC;

-- 2. Count employee posts that should appear on homepage
SELECT 
    COUNT(*) as total_employee_posts_on_homepage,
    COUNT(photo_url) as employee_posts_with_photos,
    COUNT(*) - COUNT(photo_url) as employee_posts_without_photos
FROM get_public_posts()
WHERE post_type = 'employee';

-- 3. Check if any employee posts are older than 30 days (filtered out)
SELECT 
    COUNT(*) as employee_posts_older_than_30_days,
    COUNT(photo_url) as older_posts_with_photos
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
AND created_at < now() - interval '30 days';

-- 4. Show the most recent employee posts with photos
SELECT 
    id,
    work,
    photo_url,
    created_at,
    AGE(created_at) as post_age
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
AND photo_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
