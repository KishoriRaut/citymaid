-- ============================================================================
-- Fix Ambiguous Status References
-- ============================================================================
-- Run this if you're getting "column reference 'status' is ambiguous" errors
-- This recreates the functions with explicit table aliases
-- ============================================================================

-- Drop and recreate get_public_posts() function with explicit aliases
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
        -- Explicitly qualify all column references to avoid ambiguity
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM public.payments pay
                WHERE pay.post_id = p.id 
                AND pay.status = 'approved'
            ) THEN p.contact
            ELSE NULL
        END AS contact,
        p.photo_url,
        p.status,
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- Drop and recreate get_post_with_contact_visibility() function
DROP FUNCTION IF EXISTS public.get_post_with_contact_visibility(UUID);

CREATE OR REPLACE FUNCTION public.get_post_with_contact_visibility(post_uuid UUID)
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
    created_at TIMESTAMPTZ,
    contact_visible BOOLEAN
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
        p.contact,
        p.photo_url,
        p.status,
        p.created_at,
        -- Explicitly qualify payment status to avoid ambiguity
        EXISTS (
            SELECT 1 
            FROM public.payments pay
            WHERE pay.post_id = p.id 
            AND pay.status = 'approved'
        ) AS contact_visible
    FROM public.posts p
    WHERE p.id = post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_post_with_contact_visibility(UUID) TO service_role;

-- ============================================================================
-- Verification
-- ============================================================================
-- Test the functions:
-- SELECT * FROM get_public_posts() LIMIT 1;
-- SELECT * FROM get_post_with_contact_visibility('your-post-uuid-here');
