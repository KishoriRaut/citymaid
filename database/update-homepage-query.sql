-- ============================================================================
-- Update Homepage Query for Paid Homepage Feature
-- ============================================================================
-- This modifies the get_public_posts function to require homepage payment approval
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Update get_public_posts function to require homepage payment approval
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
    homepage_payment_status TEXT,
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
                SELECT 1 FROM public.payments pay
                WHERE pay.post_id = p.id 
                AND pay.status = 'approved'
            ) THEN p.contact
            ELSE NULL
        END AS contact,
        p.photo_url,
        p.status,
        p.homepage_payment_status,
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'
        -- NEW: Only show posts with approved homepage payment
        AND p.homepage_payment_status = 'approved'
        -- 30-day expiration: Only show posts created within the last 30 days
        AND p.created_at >= now() - interval '30 days'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a new function for all approved posts (for other listing pages)
CREATE OR REPLACE FUNCTION public.get_all_approved_posts()
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
    homepage_payment_status TEXT,
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
        p.status,
        p.homepage_payment_status,
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'
        -- 30-day expiration: Only show posts created within the last 30 days
        AND p.created_at >= now() - interval '30 days'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_approved_posts() TO anon, authenticated;

-- Step 4: Verify the changes
-- Test homepage query (should only return posts with homepage_payment_status = 'approved')
SELECT 'Homepage Posts (Paid Only)' as query_type, COUNT(*) as count FROM get_public_posts();

-- Test all approved posts query (should return all approved posts)
SELECT 'All Approved Posts' as query_type, COUNT(*) as count FROM get_all_approved_posts();

-- Show sample homepage posts with their payment status
SELECT 
    id, 
    status, 
    homepage_payment_status,
    created_at
FROM get_public_posts() 
LIMIT 5;
