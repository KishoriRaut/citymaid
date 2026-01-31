-- Debug: Check contact unlock requests and RLS policies
-- Run this in Supabase SQL Editor

-- 1. Check if there are any contact unlock requests
SELECT COUNT(*) as total_requests FROM contact_unlock_requests;

-- 2. Show recent contact unlock requests
SELECT 
  id,
  post_id,
  visitor_id,
  user_name,
  user_phone,
  user_email,
  status,
  payment_proof,
  created_at
FROM contact_unlock_requests 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check RLS policies on contact_unlock_requests table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'contact_unlock_requests';

-- 4. Test direct query (bypass RLS)
-- This should work if we have service role access
SELECT 
  id,
  post_id,
  user_name,
  user_phone,
  status
FROM contact_unlock_requests 
LIMIT 3;
