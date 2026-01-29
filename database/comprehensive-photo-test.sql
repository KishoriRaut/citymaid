-- Comprehensive test to identify why photos are not fetching in admin
-- This will check every layer of the photo system

-- 1. Check ALL posts in the system (not just approved)
SELECT 
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photo_url,
    COUNT(*) - COUNT(photo_url) as posts_without_photo_url,
    'ALL_POSTS' as scope
FROM public.posts

UNION ALL

SELECT 
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photo_url,
    COUNT(*) - COUNT(photo_url) as posts_without_photo_url,
    'APPROVED_POSTS' as scope
FROM public.posts 
WHERE status = 'approved'

UNION ALL

SELECT 
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photo_url,
    COUNT(*) - COUNT(photo_url) as posts_without_photo_url,
    'PENDING_POSTS' as scope
FROM public.posts 
WHERE status = 'pending';

-- 2. Show the actual photo URLs that exist
SELECT 
    id,
    post_type,
    work,
    status,
    photo_url,
    CASE 
        WHEN photo_url IS NULL THEN 'NULL_URL'
        WHEN photo_url LIKE '%receipt-%' THEN 'RECEIPT_URL'
        ELSE 'EMPLOYEE_PHOTO_URL'
    END as url_type,
    created_at
FROM public.posts 
WHERE photo_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 15;

-- 3. Test if these URLs are actually valid and accessible
SELECT 
    id,
    work,
    photo_url,
    CASE 
        WHEN photo_url LIKE 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/%' THEN 'CORRECT_DOMAIN'
        ELSE 'WRONG_DOMAIN'
    END as domain_check,
    CASE 
        WHEN photo_url ~ '\.(jpg|jpeg|png|webp)$' THEN 'VALID_EXTENSION'
        ELSE 'INVALID_EXTENSION'
    END as extension_check,
    LENGTH(photo_url) as url_length
FROM public.posts 
WHERE photo_url IS NOT NULL
LIMIT 10;

-- 4. Check if the files actually exist in storage
WITH photo_files AS (
    SELECT 
        id,
        work,
        photo_url,
        SUBSTRING(photo_url FROM '([^/]+)$') as filename
    FROM public.posts 
    WHERE photo_url IS NOT NULL
    LIMIT 10
)
SELECT 
    pf.id,
    pf.work,
    pf.photo_url,
    pf.filename,
    CASE 
        WHEN so.name IS NOT NULL THEN 'FILE_EXISTS'
        ELSE 'FILE_MISSING'
    END as storage_status,
    so.created_at as file_created_at
FROM photo_files pf
LEFT JOIN storage.objects so ON pf.filename = so.name AND so.bucket_id = 'post-photos';

-- 5. Check what the admin page actually queries for
-- This simulates the admin page data fetch
SELECT 
    id,
    post_type,
    work,
    status,
    photo_url,
    created_at,
    -- Admin page shows posts regardless of status
    CASE 
        WHEN photo_url IS NOT NULL THEN 'SHOULD_SHOW_PHOTO'
        ELSE 'SHOULD_SHOW_PLACEHOLDER'
    END as admin_display_logic
FROM public.posts 
ORDER BY created_at DESC
LIMIT 10;
