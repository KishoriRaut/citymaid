-- ============================================================================
-- SIMPLE API FUNCTION - WORKING VERSION
-- ============================================================================
-- This creates a simple API function that avoids aggregate issues
-- ============================================================================

-- 1. CREATE SIMPLE API FUNCTION
DROP FUNCTION IF EXISTS public.get_posts_api();

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
  offset_val INT;
  total_posts BIGINT;
  post_count INT;
BEGIN
  -- Calculate offset
  offset_val := (page_param - 1) * limit_param;
  
  -- Get total count first
  IF post_type_filter = 'all' THEN
    SELECT COUNT(*) INTO total_posts
    FROM public.posts p
    WHERE p.status = 'approved'
      AND p.created_at >= now() - interval '30 days';
  ELSE
    SELECT COUNT(*) INTO total_posts
    FROM public.posts p
    WHERE p.status = 'approved'
      AND p.post_type = post_type_filter
      AND p.created_at >= now() - interval '30 days';
  END IF;
  
  -- Get posts as JSON array (simpler approach)
  IF post_type_filter = 'all' THEN
    SELECT jsonb_build_array(
      COALESCE(
        (
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
          )
          FROM (
            SELECT p.*
            FROM public.posts p
            WHERE p.status = 'approved'
              AND p.created_at >= now() - interval '30 days'
            ORDER BY p.created_at DESC
            LIMIT limit_param
            OFFSET offset_val
          ) p
        ),
        '[]'::jsonb
      )
    ) INTO posts;
  ELSE
    SELECT jsonb_build_array(
      COALESCE(
        (
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
          )
          FROM (
            SELECT p.*
            FROM public.posts p
            WHERE p.status = 'approved'
              AND p.post_type = post_type_filter
              AND p.created_at >= now() - interval '30 days'
            ORDER BY p.created_at DESC
            LIMIT limit_param
            OFFSET offset_val
          ) p
        ),
        '[]'::jsonb
      )
    ) INTO posts;
  END IF;
  
  -- Calculate pagination
  RETURN QUERY SELECT 
    posts,
    total_posts,
    page_param,
    CEIL(total_posts::FLOAT / limit_param),
    page_param < CEIL(total_posts::FLOAT / limit_param),
    page_param > 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_posts_api(INT, INT, TEXT) TO public;

-- Test the function
SELECT 'Simple API function created successfully' as status;
