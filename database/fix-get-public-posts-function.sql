-- ============================================================================
-- Fix get_public_posts RPC Function
-- ============================================================================
-- This creates the missing get_public_posts function that the app needs
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_public_posts(
  p_post_type TEXT,
  p_work TEXT,
  p_place TEXT,
  p_limit INT,
  p_offset INT,
  p_viewer_user_id TEXT
);

-- Create the get_public_posts function
CREATE OR REPLACE FUNCTION get_public_posts(
  p_post_type TEXT DEFAULT NULL,
  p_work TEXT DEFAULT NULL,
  p_place TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_viewer_user_id TEXT DEFAULT NULL
)
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
  created_at TIMESTAMPTZ,
  contact_visible BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.post_type,
    p.work,
    p."time",
    p.place,
    p.salary,
    -- Contact visibility logic
    CASE 
      WHEN p.status = 'approved' AND p.homepage_payment_status = 'approved' THEN p.contact
      WHEN p.status = 'approved' AND EXISTS (
        SELECT 1 FROM public.contact_unlock_requests cur
        WHERE cur.post_id = p.id 
        AND cur.status = 'approved'
        AND cur.visitor_id = p_viewer_user_id
      ) THEN p.contact
      ELSE 
        -- Mask contact for non-approved posts
        CASE 
          WHEN LENGTH(p.contact) >= 10 THEN SUBSTRING(p.contact, 1, 2) || '****' || SUBSTRING(p.contact, -2)
          WHEN LENGTH(p.contact) >= 7 THEN SUBSTRING(p.contact, 1, 2) || '****' || SUBSTRING(p.contact, -2)
          ELSE SUBSTRING(p.contact, 1, 2) || '****'
        END
    END AS contact,
    p.photo_url,
    p.status,
    p.homepage_payment_status,
    p.created_at,
    -- Contact visibility flag
    CASE 
      WHEN p.status = 'approved' AND p.homepage_payment_status = 'approved' THEN true
      WHEN p.status = 'approved' AND EXISTS (
        SELECT 1 FROM public.contact_unlock_requests cur
        WHERE cur.post_id = p.id 
        AND cur.status = 'approved'
        AND cur.visitor_id = p_viewer_user_id
      ) THEN true
      ELSE false
    END AS contact_visible
  FROM public.posts p
  WHERE p.status = 'approved'
    AND (p_post_type IS NULL OR p.post_type = p_post_type)
    AND (p_work IS NULL OR p.work = p_work)
    AND (p_place IS NULL OR p.place ILIKE '%' || p_place || '%')
  ORDER BY 
    -- Homepage featured posts first (approved homepage payment and within 30 days)
    CASE 
      WHEN p.homepage_payment_status = 'approved' 
           AND p.created_at >= NOW() - INTERVAL '30 days' 
      THEN 0 
      ELSE 1 
    END,
    p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Verify the function was created
SELECT 
  proname,
  proargtypes,
  prorettype
FROM pg_proc 
WHERE proname = 'get_public_posts';

-- Test the function (optional)
-- SELECT * FROM get_public_posts(NULL, NULL, NULL, 5, 0, NULL);
