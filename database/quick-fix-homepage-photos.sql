-- ============================================================================
-- Quick Fix - Update get_public_posts to Include employee_photo
-- ============================================================================
-- This is the immediate fix for homepage photos
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Check current function definition
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_public_posts';

-- Update function to include employee_photo
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

-- Test the function
SELECT 
    id,
    post_type,
    work,
    employee_photo,
    'Has Employee Photo' as photo_status
FROM get_public_posts() 
WHERE post_type = 'employee'
LIMIT 3;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;
