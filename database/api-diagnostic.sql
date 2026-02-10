-- ============================================================================
-- DATABASE DIAGNOSTIC FOR PUBLIC POSTS API
-- ============================================================================
-- This checks if the database function and table structure exist
-- ============================================================================

-- 1. Check if posts table exists
SELECT 'Table Check:' as check_type,
       EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = 'posts'
       ) as posts_table_exists;

-- 2. Check posts table structure
SELECT 'Table Structure:' as check_type,
       column_name, 
       data_type, 
       is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'posts'
ORDER BY ordinal_position;

-- 3. Check if get_public_posts function exists
SELECT 'Function Check:' as check_type,
       EXISTS (
         SELECT 1 FROM information_schema.routines 
         WHERE routine_schema = 'public' 
         AND routine_name = 'get_public_posts'
       ) as function_exists;

-- 4. Check sample data in posts table
SELECT 'Sample Data:' as check_type,
       COUNT(*) as total_posts,
       COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_posts,
       COUNT(CASE WHEN post_type = 'employee' THEN 1 END) as employee_posts,
       COUNT(CASE WHEN post_type = 'employer' THEN 1 END) as employer_posts
FROM public.posts;

-- 5. Test the function directly
SELECT 'Function Test:' as check_type,
       * FROM public.get_public_posts(1, 12, 'all') LIMIT 1;

SELECT 'Database diagnostic completed' as status;
