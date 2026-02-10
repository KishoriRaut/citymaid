-- ============================================================================
-- QUICK TEST AND API ROUTE UPDATE
-- ============================================================================
-- This tests if the function exists and updates the API route
-- ============================================================================

-- 1. Test if function exists
SELECT 'Function exists check:' as status,
       EXISTS (
         SELECT 1 FROM information_schema.routines 
         WHERE routine_name = 'get_posts_api'
         AND routine_schema = 'public'
       )::int as function_exists;

-- 2. If function doesn't exist, create a simple version
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'get_posts_api'
    AND routine_schema = 'public'
  ) THEN
    -- Create very simple function
    EXECUTE $sql$
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
      BEGIN
        -- Get total count
        SELECT COUNT(*) INTO total_posts
        FROM public.posts p
        WHERE p.status = 'approved'
          AND (post_type_filter = 'all' OR p.post_type = post_type_filter);
        
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
          CEIL(total_posts::FLOAT / limit_param),
          page_param < CEIL(total_posts::FLOAT / limit_param),
          page_param > 1;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    $sql$;
    
    -- Grant permissions
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_posts_api(INT, INT, TEXT) TO public';
    
    RAISE NOTICE 'Simple API function created successfully';
  END IF;
END $$;

-- 3. Test the function
SELECT 'Testing function:' as status;
SELECT * FROM public.get_posts_api(1, 12, 'all') LIMIT 1;
