-- ============================================================================
-- POSTGRESQL FUNCTION RETURN TYPE FIX
-- ============================================================================
-- Fixes the type mismatch in get_public_posts function
-- ============================================================================

-- 1. CREATE CORRECTED POSTS FUNCTION
CREATE OR REPLACE FUNCTION public.get_public_posts(
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
  offset_val INT;
  total_posts BIGINT;
  posts_data JSONB;
  total_pages_val INT;
BEGIN
  -- Calculate offset
  offset_val := (page_param - 1) * limit_param;
  
  -- Get total count
  IF post_type_filter = 'all' THEN
    SELECT COUNT(*) INTO total_posts
    FROM public.posts p
    WHERE p.status = 'approved';
  ELSE
    SELECT COUNT(*) INTO total_posts
    FROM public.posts p
    WHERE p.status = 'approved'
      AND p.post_type = post_type_filter;
  END IF;
  
  -- Calculate total pages as integer with safe division
  total_pages_val := CEIL(total_posts::FLOAT / NULLIF(limit_param, 0))::INTEGER;
  
  -- Get posts data
  IF post_type_filter = 'all' THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'post_type', p.post_type,
        'work', p.work,
        'time', p.time,
        'place', p.place,
        'salary', p.salary,
        'contact', CASE 
          WHEN LENGTH(p.contact) >= 4 THEN 
            LEFT(p.contact, 2) || '***' || RIGHT(p.contact, 2)
          ELSE '***'
        END,
        'details', p.details,
        'photo_url', CASE 
          WHEN p.post_type = 'employee' THEN p.employee_photo
          ELSE p.photo_url
        END,
        'employee_photo', p.employee_photo,
        'status', p.status,
        'created_at', p.created_at
      )
    ) INTO posts_data
    FROM (
      SELECT p.*
      FROM public.posts p
      WHERE p.status = 'approved'
      ORDER BY p.created_at DESC
      LIMIT limit_param
      OFFSET offset_val
    ) p;
  ELSE
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'post_type', p.post_type,
        'work', p.work,
        'time', p.time,
        'place', p.place,
        'salary', p.salary,
        'contact', CASE 
          WHEN LENGTH(p.contact) >= 4 THEN 
            LEFT(p.contact, 2) || '***' || RIGHT(p.contact, 2)
          ELSE '***'
        END,
        'details', p.details,
        'photo_url', CASE 
          WHEN p.post_type = 'employee' THEN p.employee_photo
          ELSE p.photo_url
        END,
        'employee_photo', p.employee_photo,
        'status', p.status,
        'created_at', p.created_at
      )
    ) INTO posts_data
    FROM (
      SELECT p.*
      FROM public.posts p
      WHERE p.status = 'approved'
        AND p.post_type = post_type_filter
      ORDER BY p.created_at DESC
      LIMIT limit_param
      OFFSET offset_val
    ) p;
  END IF;
  
  -- Return results with exact type matching
  RETURN QUERY SELECT 
    COALESCE(posts_data, '[]'::jsonb),
    total_posts,
    page_param,
    total_pages_val,
    page_param < total_pages_val,
    page_param > 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION public.get_public_posts(INT, INT, TEXT) TO public;

-- 3. TEST THE FUNCTION
SELECT 'Testing type-corrected function:' as test_type;
SELECT * FROM public.get_public_posts(1, 12, 'all') LIMIT 1;

SELECT 'PostgreSQL function return type fix completed successfully' as final_status;
