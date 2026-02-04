-- Simple Admin User Creation Script
-- Run this in your Supabase SQL Editor

-- Check if admin user exists
SELECT id, email, created_at, raw_user_meta_data FROM auth.users WHERE email = 'kishoriraut369@gmail.com';

-- If user doesn't exist, create it via Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Click "Add user"
-- 3. Email: kishoriraut369@gmail.com
-- 4. Password: admin123k
-- 5. Check "Auto-confirm user"
-- 6. Click "Save"

-- After creating the user, set their admin metadata
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
