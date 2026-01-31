-- ============================================================================
-- Debug Employee Photo Data - Check 2
-- ============================================================================
-- Run this in Supabase SQL Editor to debug employee photo issues
-- ============================================================================

-- Check if employee_photo column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name IN ('photo_url', 'employee_photo')
ORDER BY column_name;

-- Show sample employee posts with all photo data
SELECT 
    p.id,
    p.post_type,
    p.work,
    p.photo_url as original_photo_url,
    p.employee_photo as employee_photo_column,
    p.status,
    p.created_at,
    -- Check if photo URLs look valid
    CASE 
        WHEN p.employee_photo IS NOT NULL THEN 'Has Employee Photo'
        WHEN p.photo_url IS NOT NULL THEN 'Has Photo URL Only'
        ELSE 'No Photos'
    END as photo_status
FROM public.posts p
WHERE p.post_type = 'employee'
ORDER BY p.created_at DESC
LIMIT 10;

-- Test the exact query used by getAllPosts
SELECT 
    p.id, 
    p.post_type, 
    p.work, 
    p.time, 
    p.place, 
    p.salary, 
    p.contact, 
    p.photo_url, 
    p.employee_photo, 
    p.status, 
    p.homepage_payment_status, 
    p.payment_proof, 
    p.created_at
FROM public.posts p
WHERE p.post_type = 'employee'
ORDER BY p.created_at DESC
LIMIT 3;

-- If employee_photo is empty but photo_url has data, show those records
SELECT 
    id,
    work,
    photo_url,
    employee_photo,
    'Needs Migration' as action_required
FROM public.posts
WHERE post_type = 'employee'
AND photo_url IS NOT NULL
AND employee_photo IS NULL
LIMIT 5;
