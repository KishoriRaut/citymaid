-- Create the get_public_posts RPC function
-- Run this in Supabase SQL Editor to fix the homepage fetching issue

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_public_posts();

-- Create the function with proper return type
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
        p.photo_url,
        p.status,
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'
        AND p.created_at >= now() - interval '30 days'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- Test the function
SELECT * FROM get_public_posts() LIMIT 5;

-- Verify function exists
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_public_posts';
