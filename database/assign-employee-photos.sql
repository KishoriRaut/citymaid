-- Assign employee photos to employee posts that need them
-- This will complete the fix by giving employee posts actual photos

-- 1. Show available employee photos in storage
SELECT 
    name,
    created_at,
    'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url
FROM storage.objects 
WHERE bucket_id = 'post-photos'
AND name NOT LIKE 'receipt-%'
AND name ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$'
ORDER BY created_at DESC
LIMIT 20;

-- 2. Count how many employee posts need photos
SELECT 
    COUNT(*) as employee_posts_total,
    COUNT(photo_url) as employee_posts_with_photos,
    COUNT(*) - COUNT(photo_url) as employee_posts_need_photos
FROM public.posts 
WHERE post_type = 'employee'
AND status = 'approved';

-- 3. Assign employee photos to posts that need them (match by creation time)
UPDATE public.posts 
SET photo_url = so.full_url
FROM (
    SELECT 
        name,
        created_at,
        'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url
    FROM storage.objects 
    WHERE bucket_id = 'post-photos'
    AND name NOT LIKE 'receipt-%'
    AND name ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$'
) so
WHERE public.posts.post_type = 'employee'
AND public.posts.photo_url IS NULL
AND public.posts.status = 'approved'
AND public.posts.created_at >= so.created_at - INTERVAL '72 hours'
AND public.posts.created_at <= so.created_at + INTERVAL '72 hours'
AND NOT EXISTS (
    SELECT 1 FROM public.posts p2 
    WHERE p2.photo_url = so.full_url
);

-- 4. If some posts still need photos, assign remaining photos by order
UPDATE public.posts 
SET photo_url = (
    SELECT so.full_url
    FROM (
        SELECT 
            name,
            created_at,
            'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url,
            ROW_NUMBER() OVER (ORDER BY created_at DESC) as photo_rank
        FROM storage.objects 
        WHERE bucket_id = 'post-photos'
        AND name NOT LIKE 'receipt-%'
        AND name ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$'
    ) so
    WHERE NOT EXISTS (
        SELECT 1 FROM public.posts p2 
        WHERE p2.photo_url = so.full_url
    )
    ORDER BY so.photo_rank
    LIMIT 1
)
WHERE public.posts.post_type = 'employee'
AND public.posts.photo_url IS NULL
AND public.posts.status = 'approved'
AND EXISTS (
    SELECT 1 FROM storage.objects so2
    WHERE so2.bucket_id = 'post-photos'
    AND so2.name NOT LIKE 'receipt-%'
    AND so2.name ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$'
    AND NOT EXISTS (
        SELECT 1 FROM public.posts p3 
        WHERE p3.photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || so2.name
    )
    LIMIT 1
);

-- 5. Show the final result - what homepage and admin will see now
SELECT 
    id,
    post_type,
    work,
    status,
    photo_url,
    CASE 
        WHEN photo_url IS NULL THEN 'NO_PHOTO'
        WHEN photo_url LIKE '%receipt-%' THEN 'HAS_RECEIPT_PHOTO'
        ELSE 'HAS_EMPLOYEE_PHOTO'
    END as photo_status,
    created_at
FROM public.posts 
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 15;

-- 6. Final count - should show employee posts with photos
SELECT 
    post_type,
    COUNT(*) as total_approved_posts,
    COUNT(photo_url) as posts_with_photos,
    COUNT(*) - COUNT(photo_url) as posts_without_photos
FROM public.posts 
WHERE status = 'approved'
GROUP BY post_type;
