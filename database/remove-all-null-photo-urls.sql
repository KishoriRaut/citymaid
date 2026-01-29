-- Remove ALL NULL photo_url values from posts table
-- This will update ALL posts (employer and employee) that have NULL photo_url
-- with available photos from storage

-- 1. First, see how many posts have NULL photo_url
SELECT 
    post_type,
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photo_url,
    COUNT(*) - COUNT(photo_url) as posts_with_null_photo_url
FROM public.posts 
WHERE status = 'approved'
GROUP BY post_type;

-- 2. Show all photos available in storage
SELECT 
    name,
    created_at,
    'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url
FROM storage.objects 
WHERE bucket_id = 'post-photos'
ORDER BY created_at DESC;

-- 3. Update ALL posts with NULL photo_url using available photos
-- This will assign photos to posts based on creation time proximity
UPDATE public.posts 
SET photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || so.name
FROM storage.objects so
WHERE public.posts.photo_url IS NULL
AND so.bucket_id = 'post-photos'
AND public.posts.created_at >= so.created_at - INTERVAL '24 hours'
AND public.posts.created_at <= so.created_at + INTERVAL '24 hours'
AND NOT EXISTS (
    SELECT 1 FROM public.posts p2 
    WHERE p2.photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || so.name
);

-- 4. If some posts still have NULL photo_url, assign remaining photos by order
UPDATE public.posts 
SET photo_url = (
    SELECT 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || so.name
    FROM storage.objects so
    WHERE so.bucket_id = 'post-photos'
    AND NOT EXISTS (
        SELECT 1 FROM public.posts p2 
        WHERE p2.photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || so.name
    )
    ORDER BY so.created_at DESC
    LIMIT 1
)
WHERE public.posts.photo_url IS NULL
AND EXISTS (
    SELECT 1 FROM storage.objects so
    WHERE so.bucket_id = 'post-photos'
    AND NOT EXISTS (
        SELECT 1 FROM public.posts p2 
        WHERE p2.photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || so.name
    )
    LIMIT 1
);

-- 5. Show final results - how many posts now have photos
SELECT 
    post_type,
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photo_url,
    COUNT(*) - COUNT(photo_url) as posts_still_null,
    'AFTER_UPDATE' as status
FROM public.posts 
WHERE status = 'approved'
GROUP BY post_type;

-- 6. Show all posts that now have photos
SELECT 
    id,
    post_type,
    work,
    photo_url,
    created_at
FROM public.posts 
WHERE status = 'approved'
AND photo_url IS NOT NULL
ORDER BY post_type, created_at DESC
LIMIT 20;

-- 7. Show any posts that still have NULL photo_url (if any)
SELECT 
    id,
    post_type,
    work,
    created_at
FROM public.posts 
WHERE status = 'approved'
AND photo_url IS NULL
ORDER BY post_type, created_at DESC;
