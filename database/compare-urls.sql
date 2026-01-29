-- Compare URLs in posts vs actual storage files
-- This will identify if there's a mismatch between database and storage

-- 1. Get photo URLs from posts table
SELECT 
    p.id,
    p.post_type,
    p.work,
    p.photo_url,
    p.status,
    p.created_at,
    CASE 
        WHEN p.photo_url IS NOT NULL THEN 'Has Photo URL'
        ELSE 'No Photo URL'
    END as url_status
FROM public.posts p
WHERE p.post_type = 'employee' 
AND p.status = 'approved'
AND p.photo_url IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- 2. Get actual files in storage
SELECT 
    name as filename,
    'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url,
    created_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'post-photos'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Find mismatches - posts with URLs that don't exist in storage
SELECT 
    p.id,
    p.work,
    p.photo_url,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.objects so 
            WHERE so.bucket_id = 'post-photos' 
            AND p.photo_url LIKE '%' || so.name || '%'
        ) THEN 'File Exists in Storage'
        ELSE 'File Missing in Storage'
    END as storage_status
FROM public.posts p
WHERE p.post_type = 'employee' 
AND p.status = 'approved'
AND p.photo_url IS NOT NULL
ORDER BY p.created_at DESC;

-- 4. Check if the URL format matches expected pattern
SELECT 
    p.id,
    p.photo_url,
    CASE 
        WHEN p.photo_url LIKE 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/%' 
        THEN 'Correct URL Format'
        ELSE 'Incorrect URL Format'
    END as format_check
FROM public.posts p
WHERE p.post_type = 'employee' 
AND p.status = 'approved'
AND p.photo_url IS NOT NULL
ORDER BY p.created_at DESC;
