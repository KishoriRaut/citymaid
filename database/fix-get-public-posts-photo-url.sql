-- ============================================================================
-- Fix get_public_posts Function - Add photo_url Field
-- ============================================================================
-- This is the exact issue - RPC function missing photo_url
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Check current function definition
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_public_posts';

-- Drop and recreate function with photo_url
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
        p.photo_url,  -- THIS IS THE MISSING FIELD!
        p.status,
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- Test the function - should now include photo_url
SELECT 
    'Fixed Function Test' as test_step,
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

-- Compare with admin query (working)
SELECT 
    'Admin Query Comparison' as test_step,
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
