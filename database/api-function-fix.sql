-- ============================================================================
-- API ROUTE FIX - USE FUNCTION INSTEAD OF DIRECT TABLE ACCESS
-- ============================================================================
-- This script creates a working API route that uses our function
-- ============================================================================

-- 1. CREATE A SIMPLER FUNCTION FOR API USE
DROP FUNCTION IF EXISTS public.get_posts_api();

CREATE OR REPLACE FUNCTION public.get_posts_api(
  page_param INT DEFAULT 1,
  limit_param INT DEFAULT 12,
  post_type_filter TEXT DEFAULT 'all',
  time_filter TEXT DEFAULT 'all'
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
  filtered_posts JSONB;
BEGIN
  -- Calculate offset
  offset_val := (page_param - 1) * limit_param;
  
  -- Get filtered posts
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
    ) INTO filtered_posts
    FROM public.posts p
    WHERE p.status = 'approved'
      AND p.created_at >= now() - interval '30 days'
    ORDER BY p.created_at DESC
    LIMIT limit_param
    OFFSET offset_val;
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
    ) INTO filtered_posts
    FROM public.posts p
    WHERE p.status = 'approved'
      AND p.post_type = post_type_filter
      AND p.created_at >= now() - interval '30 days'
    ORDER BY p.created_at DESC
    LIMIT limit_param
    OFFSET offset_val;
  END IF;
  
  -- Get total count
  IF post_type_filter = 'all' THEN
    SELECT COUNT(*) INTO total_posts
    FROM public posts p
    WHERE p.status = 'approved'
      AND p.created_at >= now() - interval '30 days';
  ELSE
    SELECT COUNT(*) INTO total_posts
    FROM public posts p
    WHERE p.status = 'approved'
      AND p.post_type = post_type_filter
      AND p.created_at >= now() - interval '30 days';
  END IF;
  
  -- Return results
  RETURN QUERY SELECT 
    COALESCE(filtered_posts, '[]'::jsonb) as posts,
    total_posts as total_count,
    page_param as current_page,
    CEIL(total_posts::FLOAT / limit_param) as total_pages,
    page_param < CEIL(total_posts::FLOAT / limit_param) as has_next_page,
    page_param > 1 as has_prev_page;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_posts_api(INT, INT, TEXT, TEXT) TO public;

-- Test the function
SELECT 'API function created successfully' as status;
SELECT * FROM public.get_posts_api(1, 12, 'all', 'all') LIMIT 1;
