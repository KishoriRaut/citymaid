-- ============================================================================
-- SIMPLE API FUNCTION (TYPE CORRECTED)
-- ============================================================================
-- This creates a working API function with correct types
-- ============================================================================

-- 1. Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_posts_api(INT, INT, TEXT);

-- 2. Create simple working API function
CREATE OR REPLACE FUNCTION public.get_posts_api(
  page_param INT DEFAULT 1,
  limit_param INT DEFAULT 12,
  post_type_filter TEXT DEFAULT 'all'
)
RETURNS TABLE (
  posts JSONB,
  total_count BIGINT,
  current_page INT,
  total_pages INT,
  has_next_page BOOLEAN,
  has_prev_page BOOLEAN
) AS $$
DECLARE
  result JSONB;
  total_posts BIGINT;
  total_pages INT;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_posts
  FROM public.posts p
  WHERE p.status = 'approved'
    AND (post_type_filter = 'all' OR p.post_type = post_type_filter);
  
  -- Calculate total pages
  total_pages := CEIL(total_posts::FLOAT / limit_param);
  
  -- Get posts as JSON
  SELECT COALESCE(jsonb_agg(p), '[]'::jsonb) INTO result
  FROM (
    SELECT 
      id, post_type, work, "time", place, salary,
      CASE 
        WHEN LENGTH(contact) >= 4 THEN 
          LEFT(contact, 2) || '***' || RIGHT(contact, 2)
        ELSE '***'
      END as contact,
      details,
      CASE 
        WHEN post_type = 'employee' THEN employee_photo
        ELSE photo_url
      END as photo_url,
      employee_photo, status, created_at
    FROM public.posts p
    WHERE p.status = 'approved'
      AND (post_type_filter = 'all' OR p.post_type = post_type_filter)
    ORDER BY p.created_at DESC
    LIMIT limit_param
    OFFSET (page_param - 1) * limit_param
  ) p;
  
  RETURN QUERY SELECT 
    COALESCE(result, '[]'::jsonb),
    total_posts,
    page_param,
    total_pages,
    page_param < total_pages,
    page_param > 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_posts_api(INT, INT, TEXT) TO public;

-- 4. Test the function
SELECT 'API function with correct types created successfully' as status;
SELECT * FROM public.get_posts_api(1, 12, 'all') LIMIT 1;
