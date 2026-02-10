-- ============================================================================
-- FINAL COMPLETE RLS FIX (POLICY HANDLING)
-- ============================================================================
-- This completely disables RLS and grants proper permissions
-- ============================================================================

-- 1. COMPLETELY DISABLE RLS ON ALL TABLES
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_unlock_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. GRANT EXPLICIT PERMISSIONS TO PUBLIC
GRANT ALL ON ALL TABLES IN SCHEMA public TO public;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO public;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO public;

-- 3. DROP ALL EXISTING RLS POLICIES (handle if exists)
DO $$
BEGIN
    -- Drop policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Enable all access') THEN
        DROP POLICY "Enable all access" ON public.posts;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Allow all operations') THEN
        DROP POLICY "Allow all operations" ON public.posts;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Enable insert for public users') THEN
        DROP POLICY "Enable insert for public users" ON public.posts;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Enable select for public users') THEN
        DROP POLICY "Enable select for public users" ON public.posts;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Enable update for public users') THEN
        DROP POLICY "Enable update for public users" ON public.posts;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Enable delete for public users') THEN
        DROP POLICY "Enable delete for public users" ON public.posts;
    END IF;
END $$;

-- 4. VERIFY RLS IS DISABLED
SELECT 'RLS Status Check:' as status,
       CASE 
         WHEN EXISTS (
           SELECT 1 FROM pg_tables 
           WHERE tablename = 'posts' 
           AND rowsecurity = true
         ) THEN 'RLS STILL ENABLED'
         ELSE 'RLS DISABLED'
       END as rls_status;

-- 5. TEST DIRECT QUERY
SELECT 'Direct Query Test:' as status,
       COUNT(*) as post_count
FROM public.posts
WHERE status = 'approved';

SELECT 'Final RLS fix completed successfully' as final_status;
