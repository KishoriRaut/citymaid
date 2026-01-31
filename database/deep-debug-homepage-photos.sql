-- ============================================================================
-- Deep Debug - Check Homepage Photo Pipeline
-- ============================================================================
-- Run this in Supabase SQL Editor to debug step by step
-- ============================================================================

-- Step 1: Check if get_public_posts function includes employee_photo
SELECT 
    'Function Definition Check' as step,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('photo_url', 'employee_photo')
ORDER BY column_name;

-- Step 2: Test the function directly
SELECT 
    'Function Test' as step,
    id,
    post_type,
    work,
    employee_photo IS NOT NULL as has_employee_photo,
    employee_photo,
    photo_url IS NOT NULL as has_photo_url,
    photo_url
FROM get_public_posts() 
WHERE post_type = 'employee'
LIMIT 3;

-- Step 3: Check if employee_photo data exists in posts table
SELECT 
    'Raw Posts Table Check' as step,
    COUNT(*) as total_employee_posts,
    COUNT(employee_photo) as with_employee_photo,
    COUNT(photo_url) as with_photo_url
FROM public.posts 
WHERE post_type = 'employee' AND status = 'approved';

-- Step 4: Check specific post data
SELECT 
    'Specific Post Check' as step,
    id,
    post_type,
    work,
    status,
    employee_photo,
    photo_url
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
AND employee_photo IS NOT NULL
LIMIT 1;
