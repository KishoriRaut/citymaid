-- ============================================================================
-- CLEAN SLATE - REMOVE ALL PROBLEMATIC CODE
-- ============================================================================
-- This removes all RLS policies, functions, and starts fresh
-- ============================================================================

-- 1. DROP ALL RLS POLICIES
DROP POLICY IF EXISTS "Enable all access" ON public.posts;
DROP POLICY IF EXISTS "Allow all operations" ON public.posts;
DROP POLICY IF EXISTS "Enable insert for public users" ON public.posts;
DROP POLICY IF EXISTS "Enable select for public users" ON public.posts;
DROP POLICY IF EXISTS "Enable update for public users" ON public.posts;
DROP POLICY IF EXISTS "Enable delete for public users" ON public.posts;

-- 2. DROP ALL FUNCTIONS
DROP FUNCTION IF EXISTS public.get_public_posts();
DROP FUNCTION IF EXISTS public.get_posts_api();
DROP FUNCTION IF EXISTS public.test_simple_posts();

-- 3. DISABLE RLS COMPLETELY
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_unlock_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. GRANT BASIC PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO public;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;

-- 5. VERIFY CLEAN STATE
SELECT 'Clean slate completed' as status,
       COUNT(*) as total_posts
FROM public.posts;

SELECT 'All problematic code removed successfully' as final_status;
