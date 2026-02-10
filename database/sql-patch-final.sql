-- ============================================================================
-- SQL PATCH FOR POST TYPE FILTERING AND PAGINATION SAFETY
-- ============================================================================
-- This fixes case-insensitive filtering and integer casting issues
-- ============================================================================

-- 3. Ensure SQL filtering in public.get_public_posts is case-insensitive
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
  safe_page_param INT;
  safe_limit_param INT;
BEGIN
  -- Defensive guards - ensure valid parameters
  safe_page_param := COALESCE(NULLIF(page_param, 0), 1);
  safe_limit_param := COALESCE(NULLIF(limit_param, 0), 12);
  
  -- Force minimum values
  IF safe_page_param < 1 THEN
    safe_page_param := 1;
  END IF;
  
  IF safe_limit_param < 1 THEN
    safe_limit_param := 12;
  END IF;
  
  -- Calculate offset with safe parameters
  offset_val := (safe_page_param - 1) * safe_limit_param;
  
  -- Get total count with case-insensitive filtering
  IF post_type_filter = 'all' THEN
    SELECT COUNT(*) INTO total_posts
    FROM public.posts p
    WHERE p.status = 'approved';
  ELSE
    SELECT COUNT(*) INTO total_posts
    FROM public.posts p
    WHERE p.status = 'approved'
      AND LOWER(p.post_type) = LOWER(post_type_filter);
  END IF;
  
  -- 4. Ensure pagination calculation returns integer
  total_pages_val := COALESCE(
    CAST(CEIL(total_posts::FLOAT / NULLIF(safe_limit_param, 0)) AS INTEGER),
    1
  );
  
  -- Get posts data with case-insensitive filtering
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
      LIMIT safe_limit_param
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
        AND LOWER(p.post_type) = LOWER(post_type_filter)
      ORDER BY p.created_at DESC
      LIMIT safe_limit_param
      OFFSET offset_val
    ) p;
  END IF;
  
  -- Return results with exact type matching
  RETURN QUERY SELECT 
    COALESCE(posts_data, '[]'::jsonb),
    total_posts,
    safe_page_param,
    total_pages_val,
    safe_page_param < total_pages_val,
    safe_page_param > 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_public_posts(INT, INT, TEXT) TO public;

-- 3. Test the function
SELECT 'Testing updated function with case-insensitive filtering:' as test_header;
SELECT * FROM public.get_public_posts(1, 12, 'employee');

SELECT 'Testing with mixed case:' as test_header;
SELECT * FROM public.get_public_posts(1, 12, 'EMPLOYEE');

SELECT 'Testing pagination casting:' as test_header;
SELECT * FROM public.get_public_posts(1, 0, 'all');

SELECT 'SQL patch applied successfully' as final_status;
