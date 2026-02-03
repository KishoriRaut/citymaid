-- Fix RLS Security Issues
-- Enable Row Level Security on public tables that are missing RLS

-- 1. Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on contact_submissions table  
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('payments', 'contact_submissions')
ORDER BY tablename;

-- Note: After enabling RLS, you may need to create appropriate RLS policies
-- if they don't already exist. The policies should control who can access
-- and modify data in these tables.
