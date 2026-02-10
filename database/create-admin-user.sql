-- Create admin user in Supabase Auth
-- Run this in your Supabase SQL Editor

-- First, check if the user exists
SELECT id, email, created_at FROM auth.users WHERE email = 'kishoriraut369@gmail.com';

-- If user doesn't exist, you'll need to create it via the Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Click "Add user"
-- 3. Email: kishoriraut369@gmail.com
-- 4. Password: admin123k
-- 5. Check "Auto-confirm user"
-- 6. Click "Save"

-- After creating the user, you can set their role and metadata:
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'),
    '{role}',
    '"admin"'
  )
WHERE email = 'kishoriraut369@gmail.com';

-- Create or update the user's profile
INSERT INTO profiles (id, email, role, created_at)
SELECT 
  id, 
  email, 
  'admin' as role,
  created_at
FROM auth.users 
WHERE email = 'kishoriraut369@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify the admin user setup
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data,
  p.role as profile_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'kishoriraut369@gmail.com';
