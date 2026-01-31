-- ============================================================================
-- Make Employee Photos Mandatory & Disable Employer Photos
-- ============================================================================
-- This makes employee photos mandatory and ensures employer posts don't show photos
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Add constraint to make employee photos mandatory
ALTER TABLE public.posts 
ADD CONSTRAINT employee_photo_required 
CHECK (
  (post_type = 'employee' AND photo_url IS NOT NULL AND photo_url != '') OR 
  (post_type = 'employer')
);

-- Step 2: Update existing employee posts without photos to add placeholder
UPDATE public.posts 
SET photo_url = 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/1769064665740-zdd54a.jpg'
WHERE post_type = 'employee' 
AND (photo_url IS NULL OR photo_url = '');

-- Step 3: Clear photos from employer posts (optional - for consistency)
UPDATE public.posts 
SET photo_url = NULL
WHERE post_type = 'employer';

-- Step 4: Test the constraint
SELECT 
    'Employee Photo Check' as test_type,
    COUNT(*) as total_employee_posts,
    COUNT(photo_url) as posts_with_photos,
    COUNT(*) - COUNT(photo_url) as posts_without_photos
FROM public.posts 
WHERE post_type = 'employee';

-- Step 5: Test employer posts
SELECT 
    'Employer Photo Check' as test_type,
    COUNT(*) as total_employer_posts,
    COUNT(photo_url) as posts_with_photos,
    COUNT(*) - COUNT(photo_url) as posts_without_photos
FROM public.posts 
WHERE post_type = 'employer';

-- Step 6: Show sample data
SELECT 
    'Sample Posts' as test_type,
    id,
    post_type,
    work,
    photo_url,
    CASE 
        WHEN post_type = 'employee' AND photo_url IS NOT NULL THEN 'Employee with Photo'
        WHEN post_type = 'employee' THEN 'Employee Missing Photo'
        WHEN post_type = 'employer' THEN 'Employer (No Photo)'
    END as photo_status
FROM public.posts 
WHERE status = 'approved'
ORDER BY post_type, created_at DESC
LIMIT 5;
