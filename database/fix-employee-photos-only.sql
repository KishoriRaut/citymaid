-- Fix employee photos by using only actual employee photos, not payment receipts
-- This will identify and assign proper employee profile photos

-- 1. First, identify which photos are payment receipts vs employee photos
-- Payment receipts usually have names like: receipt-*.webp, receipt-*.jpg
-- Employee photos usually have names like: 1769339532559-lh4auf.jpeg, 1769321056903-rqew3w.jpg

SELECT 
    name,
    created_at,
    CASE 
        WHEN name LIKE 'receipt-%' THEN 'PAYMENT_RECEIPT'
        WHEN name ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$' THEN 'EMPLOYEE_PHOTO'
        ELSE 'OTHER'
    END as photo_type,
    'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url
FROM storage.objects 
WHERE bucket_id = 'post-photos'
ORDER BY photo_type, created_at DESC;

-- 2. Show current posts with receipt photos (these need to be fixed)
SELECT 
    id,
    post_type,
    work,
    photo_url,
    CASE 
        WHEN photo_url LIKE '%receipt-%' THEN 'HAS_RECEIPT_PHOTO'
        ELSE 'HAS_EMPLOYEE_PHOTO'
    END as current_photo_type
FROM public.posts 
WHERE status = 'approved'
AND photo_url IS NOT NULL
ORDER BY current_photo_type, post_type, created_at DESC;

-- 3. Get only employee photos (exclude receipts)
WITH employee_photos AS (
    SELECT 
        name,
        created_at,
        'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url
    FROM storage.objects 
    WHERE bucket_id = 'post-photos'
    AND name ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$'  -- Only employee photos (timestamp format)
    AND name NOT LIKE 'receipt-%'  -- Exclude payment receipts
    ORDER BY created_at DESC
)
SELECT * FROM employee_photos;

-- 4. Update posts that currently have receipt photos to use proper employee photos
-- First, clear receipt photos from employee posts
UPDATE public.posts 
SET photo_url = NULL
WHERE post_type = 'employee'
AND photo_url LIKE '%receipt-%';

-- 5. Now assign proper employee photos to employee posts
UPDATE public.posts 
SET photo_url = ep.full_url
FROM (
    SELECT 
        name,
        created_at,
        'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url,
        ROW_NUMBER() OVER (ORDER BY created_at DESC) as photo_rank
    FROM storage.objects 
    WHERE bucket_id = 'post-photos'
    AND name ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$'
    AND name NOT LIKE 'receipt-%'
) ep
WHERE public.posts.post_type = 'employee'
AND public.posts.photo_url IS NULL
AND public.posts.created_at >= ep.created_at - INTERVAL '12 hours'
AND public.posts.created_at <= ep.created_at + INTERVAL '12 hours'
AND NOT EXISTS (
    SELECT 1 FROM public.posts p2 
    WHERE p2.photo_url = ep.full_url
);

-- 6. If some employee posts still need photos, assign remaining employee photos
UPDATE public.posts 
SET photo_url = (
    SELECT ep.full_url
    FROM (
        SELECT 
            name,
            created_at,
            'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url,
            ROW_NUMBER() OVER (ORDER BY created_at DESC) as photo_rank
        FROM storage.objects 
        WHERE bucket_id = 'post-photos'
        AND name ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$'
        AND name NOT LIKE 'receipt-%'
    ) ep
    WHERE NOT EXISTS (
        SELECT 1 FROM public.posts p2 
        WHERE p2.photo_url = ep.full_url
    )
    ORDER BY ep.photo_rank
    LIMIT 1
)
WHERE public.posts.post_type = 'employee'
AND public.posts.photo_url IS NULL
AND EXISTS (
    SELECT 1 FROM storage.objects so
    WHERE so.bucket_id = 'post-photos'
    AND so.name ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$'
    AND so.name NOT LIKE 'receipt-%'
    AND NOT EXISTS (
        SELECT 1 FROM public.posts p2 
        WHERE p2.photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || so.name
    )
    LIMIT 1
);

-- 7. Show final results - employee posts should now have proper employee photos
SELECT 
    id,
    post_type,
    work,
    photo_url,
    CASE 
        WHEN photo_url LIKE '%receipt-%' THEN 'STILL_HAS_RECEIPT_PHOTO'
        WHEN photo_url ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$' THEN 'HAS_EMPLOYEE_PHOTO'
        ELSE 'NO_PHOTO'
    END as photo_status
FROM public.posts 
WHERE status = 'approved'
AND post_type = 'employee'
ORDER BY photo_status, created_at DESC
LIMIT 20;
