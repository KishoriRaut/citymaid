-- ============================================================================
-- Check RLS Policies and Schema Permissions
-- ============================================================================
-- This checks if RLS is blocking direct access to posts table
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Check if RLS is enabled on posts table
SELECT 
    'RLS Status' as check_type,
    relrowsecurity,
    relforcerowithcheckoption,
    relforcerowithcheckoption
FROM pg_class 
WHERE relname = 'posts';

-- Step 2: Check all RLS policies on posts table
SELECT 
    'RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY policyname;

-- Step 3: Check if anon role can access posts table
SELECT 
    'Direct Table Access Test' as test_type,
    has_table_privilege,
    has_select_privilege,
    has_insert_privilege
FROM (
    SELECT 
        has_table_privilege = has_table_privilege('public', 'posts', 'SELECT,INSERT'),
        has_select_privilege = has_table_privilege('public', 'posts', 'SELECT'),
        has_insert_privilege = has_table_privilege('public', 'posts', 'INSERT')
) t
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.table_privileges 
    WHERE grantee = 'anon' 
    AND table_name = 'posts'
    AND privilege_type = 'SELECT'
);

-- Step 4: Test direct access as anon role
SELECT 
    'Anon Direct Query Test' as test_type,
    COUNT(*) as accessible_posts
FROM public.posts 
WHERE status = 'approved'
LIMIT 1;

-- Step 5: Check if anon can use the function
SELECT 
    'Anon Function Access Test' as test_type,
    has_usage_privilege
FROM information_schema.usage_privileges 
WHERE grantee = 'anon' 
AND object_name = 'get_public_posts'
AND object_type = 'FUNCTION';

-- Step 6: Test function as anon role
SELECT 
    'Anon Function Test' as test_type,
    COUNT(*) as accessible_posts
FROM get_public_posts()
LIMIT 1;

-- Step 7: Check what roles exist
SELECT 
    'Available Roles' as check_type,
    rolname,
    rolsuper
FROM pg_roles 
WHERE rolname IN ('anon', 'authenticated', 'service_role')
ORDER BY rolname;
