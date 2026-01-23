-- Simple check for email configuration
-- Run this in your Supabase SQL Editor

-- Check what tables exist in auth schema
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'auth' 
ORDER BY tablename;

-- Check redirect URLs (this should work)
SELECT * FROM auth.redirect_urls;

-- Check email templates (this should work)
SELECT * FROM auth.email_templates;

-- Check recent users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Check all columns in auth.instances (if it exists)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'instances'
ORDER BY ordinal_position;
