-- ============================================================================
-- Update get_post_with_contact_visibility() to Use Secure Masking
-- ============================================================================
-- This updates the function to return masked contacts for unpaid posts
-- Uses the same secure masking logic as get_public_posts()
-- ============================================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_post_with_contact_visibility(UUID);

-- Recreate with secure masking
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
        -- Return full contact if payment approved, otherwise return masked contact
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM public.payments pay
                WHERE pay.post_id = p.id 
                AND pay.status = 'approved'
            ) THEN p.contact
            ELSE public.mask_contact(p.contact)
        END AS contact,
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
GRANT EXECUTE ON FUNCTION public.get_post_with_contact_visibility(UUID) TO anon, authenticated, service_role;

-- ============================================================================
-- Verification
-- ============================================================================
-- Test the function:
-- SELECT * FROM get_post_with_contact_visibility('your-post-uuid-here');
-- ============================================================================
