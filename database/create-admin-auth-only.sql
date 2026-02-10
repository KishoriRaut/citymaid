-- Admin User Creation (Auth Only)
-- Run this in your Supabase SQL Editor

-- Check if admin user exists
SELECT id, email, created_at, raw_user_meta_data FROM auth.users WHERE email = 'kishoriraut369@gmail.com';

-- Set admin role for existing user
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'),
    '{role}',
    '"admin"'
  )
WHERE email = 'kishoriraut369@gmail.com';

-- Verify the admin user setup
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at
FROM auth.users 
WHERE email = 'kishoriraut369@gmail.com';
