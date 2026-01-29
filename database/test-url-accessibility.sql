-- Test if the actual image URLs are accessible
-- This will help identify if there's a URL format or accessibility issue

-- 1. Get the exact URLs that should be working
SELECT 
    p.id,
    p.work,
    p.photo_url,
    p.created_at,
    -- Extract filename from URL for comparison
    SUBSTRING(p.photo_url FROM '([^/]+)$') as filename_from_url
FROM public.posts p
WHERE p.post_type = 'employee' 
AND p.status = 'approved'
AND p.photo_url IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 5;

-- 2. Check if these filenames exist in storage
SELECT 
    p.id,
    p.work,
    p.photo_url,
    so.name as storage_filename,
    CASE 
        WHEN so.name IS NOT NULL THEN 'File exists in storage'
        ELSE 'File missing from storage'
    END as storage_status
FROM public.posts p
LEFT JOIN storage.objects so ON p.photo_url LIKE '%' || so.name || '%'
WHERE p.post_type = 'employee' 
AND p.status = 'approved'
AND p.photo_url IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 5;

-- 3. Test URL format consistency
SELECT 
    p.photo_url,
    CASE 
        WHEN p.photo_url LIKE 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/%' THEN '✅ Correct format'
        ELSE '❌ Incorrect format'
    END as format_check,
    LENGTH(p.photo_url) as url_length
FROM public.posts p
WHERE p.post_type = 'employee' 
AND p.status = 'approved'
AND p.photo_url IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 3;
