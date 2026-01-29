-- Check the connection between posts and their photos
-- This will identify if photo URLs are properly linked to posts

-- 1. Check if posts have photo_url values pointing to storage
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
    END as photo_status,
    -- Check if the photo file exists in storage
    CASE 
        WHEN p.photo_url IS NOT NULL THEN
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM storage.objects 
                    WHERE bucket_id = 'post-photos' 
                    AND name = REPLACE(p.photo_url, 'https://[PROJECT_REF].supabase.co/storage/v1/object/public/post-photos/', '')
                ) THEN 'File Exists'
                ELSE 'File Missing'
            END
        ELSE 'N/A'
    END as file_status
FROM public.posts p
WHERE p.post_type = 'employee'
ORDER BY p.created_at DESC
LIMIT 10;

-- 2. Check photo URL pattern in posts
SELECT 
    photo_url,
    COUNT(*) as count,
    post_type
FROM public.posts 
WHERE photo_url IS NOT NULL
GROUP BY photo_url, post_type
ORDER BY count DESC;

-- 3. Find posts that should have photos (employee type) but don't
SELECT 
    COUNT(*) as employee_posts_without_photos,
    MIN(created_at) as oldest_post,
    MAX(created_at) as newest_post
FROM public.posts 
WHERE post_type = 'employee' 
AND photo_url IS NULL;

-- 4. Check approved employee posts specifically
SELECT 
    COUNT(*) as total_approved_employees,
    COUNT(photo_url) as approved_with_photos,
    COUNT(*) - COUNT(photo_url) as approved_without_photos
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved';
