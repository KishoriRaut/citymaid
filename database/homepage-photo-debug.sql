-- ============================================================================
-- Homepage Photo Debug - Check Data at Each Step
-- ============================================================================
-- Run this in Supabase SQL Editor to verify data flow
-- ============================================================================

-- Step 1: Check raw posts table data
SELECT 
    'Raw Posts Table' as step,
    id,
    post_type,
    work,
    employee_photo,
    photo_url,
    status,
    created_at
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
AND employee_photo IS NOT NULL
LIMIT 2;

-- Step 2: Check what get_public_posts returns
SELECT 
    'get_public_posts Function' as step,
    id,
    post_type,
    work,
    employee_photo,
    photo_url,
    status,
    created_at
FROM get_public_posts() 
WHERE post_type = 'employee'
AND employee_photo IS NOT NULL
LIMIT 2;

-- Step 3: Check function definition
SELECT 
    'Function Definition' as step,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_public_posts';

-- Step 4: Check if employee_photo column exists
SELECT 
    'Column Check' as step,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'employee_photo';

-- Step 5: Count posts with photos
SELECT 
    'Count Check' as step,
    COUNT(*) as total_employee_posts,
    COUNT(employee_photo) as posts_with_employee_photo,
    COUNT(photo_url) as posts_with_photo_url
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved';
