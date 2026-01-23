-- ============================================================================
-- Fix/Verify: Ensure get_public_posts() function exists and works correctly
-- ============================================================================
-- Run this to recreate the function if it's missing or broken
-- ============================================================================

-- Drop and recreate the function to ensure it's correct
DROP FUNCTION IF EXISTS public.get_public_posts();

-- Recreate the function
CREATE OR REPLACE FUNCTION public.get_public_posts()
RETURNS TABLE (
    id UUID,
    post_number INTEGER,
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
        p.post_number,
        p.post_type,
        p.work,
        p."time",
        p.place,
        p.salary,
        -- Only show contact if there's an approved payment for this post
        -- This ensures contacts are never exposed unless payment is approved
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.payments pay
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
        -- 30-day expiration: Only show posts created within the last 30 days
        -- This is a soft expiration - posts are not deleted, just hidden from public view
        AND p.created_at >= now() - interval '30 days'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public (anon and authenticated users)
-- This is critical - without this, the client-side call will fail
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- Also grant to public role (covers all users)
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO public;

-- Verify the function was created
SELECT 
    routine_name,
    routine_type,
    data_type as return_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_public_posts';

-- Test the function
SELECT COUNT(*) as approved_posts_count FROM get_public_posts();
