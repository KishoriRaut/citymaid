-- Check if admin posts have photo_url data and if URLs are accessible
-- This will help identify what's blocking photos in admin interface

-- 1. Check recent posts with their photo_url status (what admin sees)
SELECT 
    id,
    post_type,
    work,
    status,
    photo_url,
    CASE 
        WHEN photo_url IS NULL THEN 'NO_PHOTO_URL'
        WHEN photo_url LIKE '%receipt-%' THEN 'HAS_RECEIPT_PHOTO'
        ELSE 'HAS_EMPLOYEE_PHOTO'
    END as photo_status,
    created_at
FROM public.posts 
WHERE status IN ('approved', 'pending')
ORDER BY created_at DESC
LIMIT 20;

-- 2. Test if the photo URLs are actually accessible
WITH post_photos AS (
    SELECT 
        id,
        work,
        photo_url,
        status,
        created_at
    FROM public.posts 
    WHERE photo_url IS NOT NULL
    AND status IN ('approved', 'pending')
    ORDER BY created_at DESC
    LIMIT 10
)
SELECT 
    pp.id,
    pp.work,
    pp.photo_url,
    pp.status,
    CASE 
        WHEN pp.photo_url LIKE '%post-photos%' THEN 'CORRECT_BUCKET'
        ELSE 'WRONG_BUCKET'
    END as bucket_check,
    CASE 
        WHEN pp.photo_url ~ 'https://jjnibbkhubafesjqjohm\.supabase\.co/storage/v1/object/public/post-photos/.*\.(jpg|jpeg|png|webp)$' THEN 'VALID_FORMAT'
        ELSE 'INVALID_FORMAT'
    END as url_format
FROM post_photos pp;

-- 3. Check if these photo URLs exist in storage
WITH post_photos AS (
    SELECT 
        id,
        work,
        photo_url,
        SUBSTRING(photo_url FROM '([^/]+)$') as filename
    FROM public.posts 
    WHERE photo_url IS NOT NULL
    AND status IN ('approved', 'pending')
    ORDER BY created_at DESC
    LIMIT 10
)
SELECT 
    pp.id,
    pp.work,
    pp.photo_url,
    pp.filename,
    CASE 
        WHEN so.name IS NOT NULL THEN 'FILE_EXISTS_IN_STORAGE'
        ELSE 'FILE_MISSING_FROM_STORAGE'
    END as storage_status
FROM post_photos pp
LEFT JOIN storage.objects so ON pp.filename = so.name
WHERE so.bucket_id = 'post-photos' OR so.bucket_id IS NULL;

-- 4. Check admin-specific data - what the admin page actually receives
-- This simulates what the admin page query would return
SELECT 
    id,
    post_type,
    work,
    photo_url,
    status,
    created_at,
    -- Add a flag to indicate if this should show in admin
    CASE 
        WHEN status IN ('approved', 'pending') THEN 'SHOW_IN_ADMIN'
        ELSE 'HIDDEN_FROM_ADMIN'
    END as admin_visibility
FROM public.posts 
ORDER BY created_at DESC
LIMIT 15;
