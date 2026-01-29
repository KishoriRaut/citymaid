-- Check recent posts to see if new photo uploads are working
-- This will show if new posts are getting photo URLs when created

-- 1. Check the most recent posts (last 24 hours)
SELECT 
    id,
    post_type,
    work,
    status,
    photo_url,
    CASE 
        WHEN photo_url IS NULL THEN 'NO_PHOTO'
        WHEN photo_url LIKE '%receipt-%' THEN 'RECEIPT_PHOTO'
        ELSE 'EMPLOYEE_PHOTO'
    END as photo_status,
    created_at,
    EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM created_at) as seconds_ago
FROM public.posts 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 2. Check posts created in the last hour (very recent)
SELECT 
    COUNT(*) as posts_last_hour,
    COUNT(photo_url) as posts_with_photos_last_hour,
    COUNT(*) - COUNT(photo_url) as posts_without_photos_last_hour
FROM public.posts 
WHERE created_at >= NOW() - INTERVAL '1 hour';

-- 3. Show the most recent posts with detailed info
SELECT 
    id,
    post_type,
    work,
    status,
    photo_url,
    created_at,
    -- Check if this looks like a newly uploaded photo
    CASE 
        WHEN photo_url IS NOT NULL THEN
            CASE 
                WHEN photo_url ~ '[0-9]{13}-[a-z0-9]+\.(jpg|jpeg|png|webp)$' THEN 'LIKELY_NEW_UPLOAD'
                ELSE 'OTHER_PHOTO'
            END
        ELSE 'NO_PHOTO'
    END as upload_type
FROM public.posts 
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if there are any posts with photo URLs that match the upload pattern
SELECT 
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_any_photo,
    COUNT(CASE WHEN photo_url ~ '[0-9]{13}-[a-z0-9]+\.(jpg|jpeg|png|webp)$' THEN 1 END) as posts_with_upload_pattern,
    COUNT(CASE WHEN photo_url LIKE '%receipt-%' THEN 1 END) as posts_with_receipts
FROM public.posts 
WHERE created_at >= NOW() - INTERVAL '7 days';
