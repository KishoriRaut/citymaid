-- ============================================================================
-- Add 30-Day Post Expiration to get_public_posts() Function
-- ============================================================================
-- This script adds automatic expiration so old posts are hidden from homepage
-- Run this in Supabase SQL Editor to apply the expiration policy
-- ============================================================================
--
-- WHAT THIS DOES:
-- - Posts older than 30 days are automatically hidden from homepage
-- - This is a SOFT expiration (posts are NOT deleted, just filtered)
-- - Admin can still see all posts (old + new) in admin panel
-- - Keeps marketplace fresh and relevant
-- - Future enhancement: Paid extensions can extend visibility
--
-- SAFE TO RUN:
-- - No schema changes (no new columns)
-- - No data loss (posts are not deleted)
-- - Reversible (can remove the date filter if needed)
-- ============================================================================

-- Drop and recreate the function with expiration logic
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
        -- This ensures contacts are never exposed unless payment is approved
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
        -- 30-day expiration: Only show posts created within the last 30 days
        -- This is a soft expiration - posts are not deleted, just hidden from public view
        -- Admin queries (getAllPosts) are NOT affected and can see all posts
        AND p.created_at >= now() - interval '30 days'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- ============================================================================
-- Verification
-- ============================================================================
-- Test the function to see only recent posts:
-- SELECT * FROM get_public_posts() LIMIT 10;
--
-- To see all posts (including old ones), use admin query:
-- SELECT * FROM posts WHERE status = 'approved' ORDER BY created_at DESC;
-- ============================================================================
