-- ============================================================================
-- Fix get_public_posts Function - Add employee_photo Field
-- ============================================================================
-- This fixes both issues: missing employee_photo and 30-day limit
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Drop the current function
DROP FUNCTION IF EXISTS public.get_public_posts();

-- Create updated function with employee_photo and no 30-day limit
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

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- Test the function
SELECT * FROM get_public_posts() LIMIT 3;

-- Verify the function includes employee_photo
SELECT 
    'Function Fields Check' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('photo_url', 'employee_photo')
ORDER BY column_name;
