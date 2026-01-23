-- Check Supabase email configuration (correct way)
-- Run this in your Supabase SQL Editor

-- Check if email provider is enabled (correct table)
SELECT * FROM auth.instances WHERE provider = 'email';

-- Check redirect URLs
SELECT * FROM auth.redirect_urls ORDER BY created_at DESC;

-- Check email templates
SELECT * FROM auth.email_templates ORDER BY template;

-- Check recent authentication attempts
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Check if there are any configuration issues
-- This shows the auth instance configuration
SELECT * FROM auth.instances;

-- Check for any recent authentication errors
-- This might not be accessible, but let's try
SELECT * FROM auth.audit_logs ORDER BY created_at DESC LIMIT 10;

-- Alternative: Check the system configuration
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'auth' 
ORDER BY tablename;
