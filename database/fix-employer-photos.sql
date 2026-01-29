-- Fix employer photos by adding photo URLs from storage
-- This will populate the photo_url column for employer posts

-- 1. First, see what photos are in storage
SELECT 
    name,
    created_at,
    'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as full_url
FROM storage.objects 
WHERE bucket_id = 'post-photos'
ORDER BY created_at DESC
LIMIT 20;

-- 2. Update employer posts with photos from storage
-- Match recent employer posts with recent photos
UPDATE public.posts 
SET photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || so.name
FROM storage.objects so
WHERE public.posts.post_type = 'employer'
AND public.posts.photo_url IS NULL
AND so.bucket_id = 'post-photos'
AND public.posts.created_at >= so.created_at - INTERVAL '2 hours'
AND public.posts.created_at <= so.created_at + INTERVAL '2 hours'
AND NOT EXISTS (
    SELECT 1 FROM public.posts p2 
    WHERE p2.photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || so.name
);

-- 3. Show what was updated
SELECT 
    id,
    post_type,
    work,
    photo_url,
    created_at
FROM public.posts 
WHERE post_type = 'employer'
AND photo_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 4. Count employer posts with photos after update
SELECT 
    COUNT(*) as employer_posts_with_photos,
    'AFTER_UPDATE' as status
FROM public.posts 
WHERE post_type = 'employer'
AND photo_url IS NOT NULL;
