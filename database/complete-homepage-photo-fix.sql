-- ============================================================================
-- Complete Homepage Photo Fix - All Layers
-- ============================================================================
-- This fixes the entire homepage photo pipeline from database to frontend
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Verify employee_photo column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'employee_photo'
    ) THEN
        RAISE EXCEPTION 'employee_photo column does not exist - run migration first';
    END IF;
END $$;

-- Step 2: Drop and recreate get_public_posts with employee_photo
DROP FUNCTION IF EXISTS public.get_public_posts();

CREATE OR REPLACE FUNCTION public.get_public_posts()
RETURNS TABLE (
    id UUID,
    post_type TEXT,
    work TEXT,
    "time" TEXT,
    place TEXT,
    salary TEXT,
    contact TEXT,
    photo_url TEXT,
    employee_photo TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.post_type,
        p.work,
        p."time",
        p.place,
        p.salary,
        -- Only show contact if there's an approved payment for this post
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.payments pay
                WHERE pay.post_id = p.id 
                AND pay.status = 'approved'
            ) THEN p.contact
            ELSE NULL
        END AS contact,
        p.photo_url,
        p.employee_photo,
        p.status,
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- Step 4: Test the function with employee posts
SELECT 
    'Function Test Results' as test_step,
    COUNT(*) as total_approved_posts,
    COUNT(CASE WHEN post_type = 'employee' THEN 1 END) as employee_posts,
    COUNT(CASE WHEN post_type = 'employee' AND employee_photo IS NOT NULL THEN 1 END) as employee_posts_with_photos,
    COUNT(CASE WHEN post_type = 'employer' THEN 1 END) as employer_posts,
    COUNT(CASE WHEN post_type = 'employer' AND photo_url IS NOT NULL THEN 1 END) as employer_posts_with_photos
FROM get_public_posts();

-- Step 5: Show sample data with photos
SELECT 
    'Sample Employee Posts with Photos' as test_step,
    id,
    post_type,
    work,
    employee_photo,
    CASE 
        WHEN employee_photo IS NOT NULL THEN 'Has Photo'
        ELSE 'No Photo'
    END as photo_status
FROM get_public_posts() 
WHERE post_type = 'employee' 
AND employee_photo IS NOT NULL
LIMIT 3;

-- Step 6: Verify function structure
SELECT 
    'Function Structure Check' as test_step,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('photo_url', 'employee_photo')
ORDER BY column_name;
