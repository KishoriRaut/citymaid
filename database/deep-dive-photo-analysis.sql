-- ============================================================================
-- DEEP DIVE - Complete Photo Data Flow Analysis
-- ============================================================================
-- This traces the exact data flow from database to frontend
-- Run this in Supabase SQL Editor step by step
-- ============================================================================

-- STEP 1: Check raw posts table data
SELECT 
    'STEP 1 - Raw Posts Table' as analysis_step,
    id,
    post_type,
    work,
    photo_url,
    status,
    created_at,
    LENGTH(photo_url) as photo_url_length,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'Has Photo URL'
        ELSE 'No Photo URL'
    END as photo_status
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
ORDER BY created_at DESC
LIMIT 3;

-- STEP 2: Test get_public_posts function directly
SELECT 
    'STEP 2 - get_public_posts Function' as analysis_step,
    id,
    post_type,
    work,
    photo_url,
    status,
    created_at,
    LENGTH(photo_url) as photo_url_length,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'Has Photo URL'
        ELSE 'No Photo URL'
    END as photo_status
FROM get_public_posts() 
WHERE post_type = 'employee'
LIMIT 3;

-- STEP 3: Check if photo URLs are valid Supabase URLs
SELECT 
    'STEP 3 - URL Validation' as analysis_step,
    id,
    post_type,
    work,
    photo_url,
    CASE 
        WHEN photo_url LIKE 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/%' 
        THEN 'Valid Supabase URL'
        ELSE 'Invalid URL Format'
    END as url_validation,
    CASE 
        WHEN photo_url LIKE '%.jpg' OR photo_url LIKE '%.jpeg' OR photo_url LIKE '%.png' OR photo_url LIKE '%.webp'
        THEN 'Valid Image Extension'
        ELSE 'Invalid Extension'
    END as extension_validation
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
AND photo_url IS NOT NULL
LIMIT 3;

-- STEP 4: Check if photos actually exist in storage
SELECT 
    'STEP 4 - Storage Check' as analysis_step,
    id,
    post_type,
    work,
    photo_url,
    CASE 
        WHEN photo_url LIKE 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/%' 
        THEN REPLACE(photo_url, 'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/', '')
        ELSE 'Invalid URL'
    END as storage_filename
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
AND photo_url IS NOT NULL
LIMIT 3;

-- STEP 5: Count analysis
SELECT 
    'STEP 5 - Count Analysis' as analysis_step,
    'Employee Posts' as post_category,
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photo_urls,
    COUNT(*) - COUNT(photo_url) as posts_without_photo_urls,
    ROUND(COUNT(photo_url)::decimal / COUNT(*) * 100, 2) as photo_percentage
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'

UNION ALL

SELECT 
    'STEP 5 - Count Analysis' as analysis_step,
    'Employer Posts' as post_category,
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photo_urls,
    COUNT(*) - COUNT(photo_url) as posts_without_photo_urls,
    ROUND(COUNT(photo_url)::decimal / COUNT(*) * 100, 2) as photo_percentage
FROM public.posts 
WHERE post_type = 'employer' 
AND status = 'approved';
