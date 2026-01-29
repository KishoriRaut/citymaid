-- Fix the issue where payment receipts are being assigned as employee profile photos
-- This will remove receipt photos from employee posts and keep only actual employee photos

-- 1. First, identify which posts have receipt photos vs employee photos
SELECT 
    id,
    post_type,
    work,
    status,
    photo_url,
    CASE 
        WHEN photo_url LIKE '%receipt-%' THEN 'HAS_RECEIPT_PHOTO'
        WHEN photo_url ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$' THEN 'HAS_EMPLOYEE_PHOTO'
        ELSE 'NO_PHOTO'
    END as photo_type,
    created_at
FROM public.posts 
WHERE photo_url IS NOT NULL
ORDER BY photo_type, created_at DESC
LIMIT 20;

-- 2. Remove receipt photos from employee posts (they should not have receipts as profile photos)
UPDATE public.posts 
SET photo_url = NULL
WHERE post_type = 'employee'
AND photo_url LIKE '%receipt-%';

-- 3. Count how many employee posts now have proper employee photos
SELECT 
    COUNT(*) as total_employee_posts,
    COUNT(photo_url) as employee_posts_with_photos,
    COUNT(*) - COUNT(photo_url) as employee_posts_without_photos,
    'AFTER_RECEIPT_REMOVAL' as status
FROM public.posts 
WHERE post_type = 'employee';

-- 4. Show employee posts that still have photos (should only be employee photos now)
SELECT 
    id,
    work,
    photo_url,
    created_at
FROM public.posts 
WHERE post_type = 'employee'
AND photo_url IS NOT NULL
AND photo_url NOT LIKE '%receipt-%'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check if there are any employee photos available in storage to assign
SELECT 
    name,
    created_at,
    'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url
FROM storage.objects 
WHERE bucket_id = 'post-photos'
AND name NOT LIKE 'receipt-%'
AND name ~ '^[0-9]+-.*\.(jpg|jpeg|png|webp)$'
ORDER BY created_at DESC
LIMIT 15;

-- 6. Assign proper employee photos to employee posts that need them
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
AND public.posts.created_at >= so.created_at - INTERVAL '24 hours'
AND public.posts.created_at <= so.created_at + INTERVAL '24 hours'
AND NOT EXISTS (
    SELECT 1 FROM public.posts p2 
    WHERE p2.photo_url = so.full_url
);

-- 7. Final count - employee posts should now only have employee photos
SELECT 
    COUNT(*) as total_employee_posts,
    COUNT(photo_url) as employee_posts_with_photos,
    COUNT(*) - COUNT(photo_url) as employee_posts_without_photos,
    'FINAL_RESULT' as status
FROM public.posts 
WHERE post_type = 'employee';
