-- Add photo URLs to existing posts that should have them
-- This will update posts with photo URLs from storage

-- 1. First, let's see what photos are actually in storage
SELECT 
    name,
    created_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'post-photos'
ORDER BY created_at DESC
LIMIT 20;

-- 2. Find posts that might match these photos by timestamp
-- This is a heuristic - we'll try to match photos to posts by creation time
WITH recent_photos AS (
    SELECT 
        name,
        created_at as photo_created_at,
        SUBSTRING(name FROM '^[0-9]+')::bigint as timestamp
    FROM storage.objects 
    WHERE bucket_id = 'post-photos'
    AND name ~ '^[0-9]+-.*'  -- Files that start with timestamp
    ORDER BY created_at DESC
    LIMIT 20
),
recent_posts AS (
    SELECT 
        id,
        post_type,
        work,
        created_at as post_created_at,
        EXTRACT(EPOCH FROM created_at)::bigint as post_timestamp
    FROM public.posts 
    WHERE status = 'approved'
    AND photo_url IS NULL
    ORDER BY created_at DESC
    LIMIT 20
)
SELECT 
    p.id,
    p.post_type,
    p.work,
    p.post_created_at,
    rp.name as photo_filename,
    rp.photo_created_at,
    'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || rp.name as potential_url,
    ABS(p.post_timestamp - rp.timestamp) as time_diff_seconds
FROM recent_posts p
CROSS JOIN recent_photos rp
WHERE p.post_type = 'employer'  -- Focus on employer posts first
ORDER BY time_diff_seconds
LIMIT 10;

-- 3. Update employer posts with closest photo matches
-- This will update posts with the most recently uploaded photos
UPDATE public.posts 
SET photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || so.name
FROM storage.objects so
WHERE posts.post_type = 'employer'
AND posts.photo_url IS NULL
AND so.bucket_id = 'post-photos'
AND posts.created_at >= so.created_at - INTERVAL '1 hour'
AND posts.created_at <= so.created_at + INTERVAL '1 hour'
AND NOT EXISTS (
    SELECT 1 FROM public.posts p2 
    WHERE p2.photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || so.name
);

-- 4. Show what was updated
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

-- 5. Count how many employer posts now have photos
SELECT 
    COUNT(*) as employer_posts_with_photos,
    'AFTER_UPDATE' as status
FROM public.posts 
WHERE post_type = 'employer'
AND photo_url IS NOT NULL;
