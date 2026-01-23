-- Debug script to check email provider configuration
-- Run this in your Supabase SQL Editor

-- Check if email provider is enabled
SELECT * FROM auth.config WHERE parameter = 'mailer_enabled';

-- Check email templates
SELECT * FROM auth.email_templates;

-- Check redirect URLs
SELECT * FROM auth.redirect_urls;

-- Check site URL
SELECT * FROM auth.config WHERE parameter = 'site_url';

-- Check if there are any email-related errors in logs
-- (This might not be accessible, but let's try)
SELECT * FROM auth.audit_logs ORDER BY created_at DESC LIMIT 10;

-- Test the email configuration
SELECT * FROM auth.config WHERE parameter LIKE '%email%' OR parameter LIKE '%mailer%';

-- Check if there are any authentication issues
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;
