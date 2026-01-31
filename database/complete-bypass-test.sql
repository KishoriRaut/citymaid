-- ============================================================================
-- Complete Bypass Test - Test Every Layer
-- ============================================================================
-- This bypasses all functions and tests directly
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Test direct posts table (bypass all functions)
SELECT 
    'Direct Posts Test' as test_type,
    id,
    post_type,
    work,
    photo_url,
    status,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'Has Photo'
        ELSE 'No Photo'
    END as photo_status
FROM public.posts 
WHERE post_type = 'employee' 
AND status = 'approved'
LIMIT 3;

-- Step 2: Test if get_public_posts function exists and works
SELECT 
    'Function Test' as test_type,
    id,
    post_type,
    work,
    photo_url,
    status,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'Has Photo'
        ELSE 'No Photo'
    END as photo_status
FROM get_public_posts() 
WHERE post_type = 'employee'
LIMIT 3;

-- Step 3: Create a simple test function that definitely includes photo_url
CREATE OR REPLACE FUNCTION test_photos()
RETURNS TABLE (
    id UUID,
    post_type TEXT,
    work TEXT,
    photo_url TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.post_type,
        p.work,
        p.photo_url,
        p.status
    FROM public.posts p
    WHERE p.status = 'approved'
    ORDER BY p.created_at DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Test the simple function
SELECT 
    'Simple Function Test' as test_type,
    id,
    post_type,
    work,
    photo_url,
    status,
    CASE 
        WHEN photo_url IS NOT NULL THEN 'Has Photo'
        ELSE 'No Photo'
    END as photo_status
FROM test_photos()
WHERE post_type = 'employee'
LIMIT 3;

-- Step 5: Grant permissions for test function
GRANT EXECUTE ON FUNCTION test_photos() TO anon, authenticated;

-- Step 6: Count photos in each layer
SELECT 
    'Photo Count Comparison' as comparison,
    'Direct Posts Table' as source,
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photos
FROM public.posts 
WHERE post_type = 'employee' AND status = 'approved'

UNION ALL

SELECT 
    'Photo Count Comparison' as comparison,
    'get_public_posts Function' as source,
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photos
FROM get_public_posts() 
WHERE post_type = 'employee'

UNION ALL

SELECT 
    'Photo Count Comparison' as comparison,
    'test_photos Function' as source,
    COUNT(*) as total_posts,
    COUNT(photo_url) as posts_with_photos
FROM test_photos() 
WHERE post_type = 'employee';
