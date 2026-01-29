-- Fix the current photo issues: remove receipts from employers, add photos to employees
-- This targets the specific problems identified

-- 1. Remove receipt photos from ALL employer posts (they should not have photos)
UPDATE public.posts 
SET photo_url = NULL
WHERE post_type = 'employer'
AND photo_url LIKE '%receipt-%';

-- 2. Check how many employee posts need photos
SELECT 
    COUNT(*) as employee_posts_needing_photos,
    COUNT(photo_url) as employee_posts_with_photos,
    COUNT(*) - COUNT(photo_url) as employee_posts_without_photos
FROM public.posts 
WHERE post_type = 'employee'
AND status = 'approved';

-- 3. Get available employee photos from storage
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

-- 4. Assign employee photos to employee posts that need them
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
AND public.posts.created_at >= so.created_at - INTERVAL '48 hours'
AND public.posts.created_at <= so.created_at + INTERVAL '48 hours'
AND NOT EXISTS (
    SELECT 1 FROM public.posts p2 
    WHERE p2.photo_url = so.full_url
);

-- 5. Show the final result - what the homepage and admin will see
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
