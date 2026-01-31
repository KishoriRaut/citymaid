-- ============================================================================
-- FIX NULL photo_url - Populate Employee Photos
-- ============================================================================
-- This fixes the root cause: photo_url is null for employee posts
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Check current state
SELECT 
    'BEFORE FIX' as status,
    COUNT(*) as total_employee_posts,
    COUNT(photo_url) as posts_with_photos,
    COUNT(*) - COUNT(photo_url) as posts_without_photos
FROM public.posts 
WHERE post_type = 'employee' AND status = 'approved';

-- Step 2: Find a working photo URL from storage
SELECT 
    'Available Photos in Storage' as status,
    name,
    created_at
FROM storage.objects 
WHERE bucket_id = 'post-photos' 
AND name NOT LIKE 'receipt-%'
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: Update employee posts with photos from storage
UPDATE public.posts 
SET photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || (
    SELECT name 
    FROM storage.objects 
    WHERE bucket_id = 'post-photos' 
    AND name NOT LIKE 'receipt-%'
    ORDER BY created_at DESC
    LIMIT 1
)
WHERE post_type = 'employee' 
AND status = 'approved'
AND photo_url IS NULL;

-- Step 4: Verify the fix
SELECT 
    'AFTER FIX' as status,
    COUNT(*) as total_employee_posts,
    COUNT(photo_url) as posts_with_photos,
    COUNT(*) - COUNT(photo_url) as posts_without_photos
FROM public.posts 
WHERE post_type = 'employee' AND status = 'approved';

-- Step 5: Show sample data
SELECT 
    'Sample Employee Posts' as status,
    id,
    post_type,
    work,
    photo_url,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'Has Photo'
        ELSE 'No Photo'
    END as photo_status
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
LIMIT 3;
