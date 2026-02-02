-- Check for Contact Submissions Tables
-- This will show all contact-related tables and help identify which to delete

-- Show all tables that might be contact submissions related
SELECT 
    tablename,
    schemaname,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE tablename LIKE '%contact%' 
   OR tablename LIKE '%submission%'
ORDER BY tablename;

-- Show table structures for comparison
SELECT 
    'Table Structure' as info_type,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name LIKE '%contact%' 
   OR table_name LIKE '%submission%'
ORDER BY table_name, ordinal_position;

-- Show row counts for each table
SELECT 
    'Row Count' as info_type,
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = pt.tablename) as column_count,
    0 as estimated_rows  -- Simplified row count
FROM pg_tables pt
WHERE tablename LIKE '%contact%' 
   OR tablename LIKE '%submission%'
ORDER BY tablename;

-- Show RLS status for each table
SELECT 
    'RLS Status' as info_type,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = pt.tablename) as policy_count
FROM pg_tables pt
WHERE tablename LIKE '%contact%' 
   OR tablename LIKE '%submission%'
ORDER BY tablename;

-- Simple check for duplicate tables
SELECT 
    'All Contact Tables' as info_type,
    tablename,
    rowsecurity as rls_enabled,
    'Check this table' as action
FROM pg_tables 
WHERE tablename LIKE '%contact%' 
   OR tablename LIKE '%submission%'
ORDER BY tablename;
