-- ============================================================================
-- Ultimate Photo Debug - Check Every Layer
-- ============================================================================
-- Run this in Supabase SQL Editor to debug step by step
-- ============================================================================

-- Step 1: Check if get_public_posts function actually returns photo_url
SELECT 
    'Function Definition Check' as step,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('photo_url', 'employee_photo')
ORDER BY column_name;

-- Step 2: Check what the function currently returns
SELECT 
    'Current Function Return Columns' as step,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('id', 'post_type', 'work', 'photo_url', 'employee_photo', 'status', 'created_at')
ORDER BY column_name;

-- Step 3: Test the function directly
SELECT 
    'Direct Function Test' as step,
    id,
    post_type,
    work,
    photo_url,
    employee_photo,
    status,
    created_at
FROM get_public_posts() 
WHERE post_type = 'employee'
LIMIT 2;

-- Step 4: Check raw posts table data
SELECT 
    'Raw Posts Table Check' as step,
    id,
    post_type,
    work,
    photo_url,
    employee_photo,
    status,
    created_at
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
LIMIT 2;

-- Step 5: Count posts with photos in both tables
SELECT 
    'Photo Count Comparison' as step,
    'Raw Posts Table' as source,
    COUNT(*) as total_employee_posts,
    COUNT(photo_url) as posts_with_photo_url,
    COUNT(employee_photo) as posts_with_employee_photo
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'

UNION ALL

SELECT 
    'Photo Count Comparison' as step,
    'get_public_posts Function' as source,
    COUNT(*) as total_employee_posts,
    COUNT(photo_url) as posts_with_photo_url,
    COUNT(employee_photo) as posts_with_employee_photo
FROM get_public_posts() 
WHERE post_type = 'employee';

-- Step 6: Check function definition text
SELECT 
    'Function Definition Text' as step,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_public_posts';
