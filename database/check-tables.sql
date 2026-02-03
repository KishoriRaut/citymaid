-- ============================================================================
-- Database Diagnostic Script
-- ============================================================================
-- Run this script in your Supabase SQL Editor to check what tables exist
-- ============================================================================

-- Check all tables in the public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check storage buckets
SELECT 
    name,
    id,
    public,
    created_at
FROM storage.buckets 
ORDER BY name;

-- Check if RLS is enabled on tables
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check for any views
SELECT 
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
ORDER BY viewname;
