-- ============================================================================
-- Fix get_public_posts() Function - Resolve Ambiguous Status
-- ============================================================================
-- Run this in Supabase SQL Editor to fix the ambiguous status error
-- ============================================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_public_posts();

-- Recreate with explicit table aliases for all status references
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
        -- Explicitly qualify ALL column references to avoid any ambiguity
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM public.payments pay
                WHERE pay.post_id = p.id 
                AND pay.status = 'approved'  -- Explicit: payments.status
            ) THEN p.contact
            ELSE NULL
        END AS contact,
        p.photo_url,
        p.status,  -- Explicit: posts.status
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'  -- Explicit: posts.status
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- ============================================================================
-- Verification
-- ============================================================================
-- Test the function:
-- SELECT * FROM get_public_posts() LIMIT 1;
