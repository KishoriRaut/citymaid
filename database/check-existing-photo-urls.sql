-- Check what's actually in the posts table photo_url column
-- This will show us the current state of photo URLs

-- 1. Check ALL posts and their photo_url values
SELECT 
    id,
    post_type,
    work,
    photo_url,
    status,
    created_at,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'HAS_PHOTO_URL'
        ELSE 'NULL_PHOTO_URL'
    END as photo_status
FROM public.posts 
WHERE status = 'approved'
ORDER BY post_type, created_at DESC
LIMIT 20;

-- 2. Count posts by type and photo status
SELECT 
    post_type,
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photo_url,
    COUNT(*) - COUNT(photo_url) as posts_without_photo_url,
    (COUNT(photo_url)::numeric / COUNT(*)::numeric) * 100 as percentage_with_photos
FROM public.posts 
WHERE status = 'approved'
GROUP BY post_type;

-- 3. Check if there are ANY employer posts with photo_url
SELECT 
    COUNT(*) as employer_posts_total,
    COUNT(photo_url) as employer_posts_with_photos,
    CASE 
        WHEN COUNT(photo_url) > 0 THEN 'SOME_EMPLOYERS_HAVE_PHOTOS'
        ELSE 'NO_EMPLOYER_PHOTOS_FOUND'
    END as employer_photo_status
FROM public.posts 
WHERE post_type = 'employer' AND status = 'approved';

-- 4. Check if there are ANY employee posts with photo_url
SELECT 
    COUNT(*) as employee_posts_total,
    COUNT(photo_url) as employee_posts_with_photos,
    CASE 
        WHEN COUNT(photo_url) > 0 THEN 'SOME_EMPLOYEES_HAVE_PHOTOS'
        ELSE 'NO_EMPLOYEE_PHOTOS_FOUND'
    END as employee_photo_status
FROM public.posts 
WHERE post_type = 'employee' AND status = 'approved';

-- 5. Show specific employer posts that should have photos but don't
SELECT 
    id,
    work,
    photo_url,
    created_at
FROM public.posts 
WHERE post_type = 'employer' 
AND status = 'approved'
AND photo_url IS NULL
ORDER BY created_at DESC
LIMIT 10;
