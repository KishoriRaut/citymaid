-- Check the CURRENT status of photos in both employer and employee posts
-- This will show what's actually fetching right now

-- 1. Check employer posts - are they showing receipt photos?
SELECT 
    id,
    post_type,
    work,
    status,
    photo_url,
    CASE 
        WHEN photo_url IS NULL THEN 'NO_PHOTO'
        WHEN photo_url LIKE '%receipt-%' THEN 'HAS_RECEIPT_PHOTO'
        WHEN photo_url ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$' THEN 'HAS_EMPLOYEE_PHOTO'
        ELSE 'OTHER_PHOTO'
    END as photo_status,
    created_at
FROM public.posts 
WHERE post_type = 'employer'
AND status = 'approved'
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check employee posts - are they showing photos?
SELECT 
    id,
    post_type,
    work,
    status,
    photo_url,
    CASE 
        WHEN photo_url IS NULL THEN 'NO_PHOTO'
        WHEN photo_url LIKE '%receipt-%' THEN 'HAS_RECEIPT_PHOTO'
        WHEN photo_url ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$' THEN 'HAS_EMPLOYEE_PHOTO'
        ELSE 'OTHER_PHOTO'
    END as photo_status,
    created_at
FROM public.posts 
WHERE post_type = 'employee'
AND status = 'approved'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Count summary - what's the current state?
SELECT 
    post_type,
    COUNT(*) as total_approved_posts,
    COUNT(photo_url) as posts_with_photos,
    COUNT(*) - COUNT(photo_url) as posts_without_photos,
    COUNT(CASE WHEN photo_url LIKE '%receipt-%' THEN 1 END) as posts_with_receipts,
    COUNT(CASE WHEN photo_url ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$' THEN 1 END) as posts_with_employee_photos
FROM public.posts 
WHERE status = 'approved'
GROUP BY post_type;

-- 4. Check the most recent posts (what homepage and admin see)
SELECT 
    id,
    post_type,
    work,
    photo_url,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as recent_rank
FROM public.posts 
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 15;
