-- ============================================================================
-- DIRECT API TEST - BYPASS ALL COMPLEXITY
-- ============================================================================
-- This creates a simple test to verify the API function works
-- ============================================================================

-- Test the API function directly to make sure it works
SELECT 'Testing API function directly:' as test_type;
SELECT * FROM public.get_posts_api(1, 12, 'all');

-- Create a very simple test function
DROP FUNCTION IF EXISTS public.test_simple_posts();

CREATE OR REPLACE FUNCTION public.test_simple_posts()
RETURNS TABLE (
  id UUID,
  post_type TEXT,
  work TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.post_type,
    p.work,
    p.status
  FROM public.posts p
  WHERE p.status = 'approved'
  ORDER BY p.created_at DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.test_simple_posts() TO public;

-- Test the simple function
SELECT 'Testing simple function:' as test_type;
SELECT * FROM public.test_simple_posts();

SELECT 'Direct test completed' as status;
