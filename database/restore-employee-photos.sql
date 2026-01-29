-- Restore employee photos that were incorrectly cleared
-- This will identify and restore the legitimate employee photos

-- 1. First, show all available employee photos in storage (excluding receipts)
SELECT 
    name,
    created_at,
    'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url
FROM storage.objects 
WHERE bucket_id = 'post-photos'
AND name NOT LIKE 'receipt-%'
AND name ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$'
ORDER BY created_at DESC;

-- 2. Show employee posts that currently have NULL photo_url
SELECT 
    id,
    post_type,
    work,
    created_at
FROM public.posts 
WHERE status = 'approved'
AND post_type = 'employee'
AND photo_url IS NULL
ORDER BY created_at DESC;

-- 3. Restore employee photos by matching posts with available photos
-- Match posts to photos based on creation time proximity
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
AND public.posts.created_at >= so.created_at - INTERVAL '12 hours'
AND public.posts.created_at <= so.created_at + INTERVAL '12 hours'
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

-- 5. Show final results - employee posts should now have photos
SELECT 
    id,
    post_type,
    work,
    photo_url,
    CASE 
        WHEN photo_url IS NULL THEN 'NO_PHOTO'
        WHEN photo_url LIKE '%receipt-%' THEN 'PAYMENT_RECEIPT'
        ELSE 'EMPLOYEE_PHOTO'
    END as photo_status
FROM public.posts 
WHERE status = 'approved'
AND post_type = 'employee'
ORDER BY photo_status DESC, created_at DESC
LIMIT 20;

-- 6. Count final results
SELECT 
    CASE 
        WHEN photo_url IS NULL THEN 'NO_PHOTO'
        WHEN photo_url LIKE '%receipt-%' THEN 'PAYMENT_RECEIPT'
        ELSE 'EMPLOYEE_PHOTO'
    END as photo_status,
    COUNT(*) as count
FROM public.posts 
WHERE status = 'approved'
AND post_type = 'employee'
GROUP BY photo_status;
