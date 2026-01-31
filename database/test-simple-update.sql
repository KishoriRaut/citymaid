-- Test: Update existing contact unlock request without contact_preference first
-- Run this in Supabase SQL Editor

-- Update one of the existing requests with sample contact info (excluding contact_preference)
UPDATE contact_unlock_requests 
SET 
  user_name = 'John Doe',
  user_phone = '9876543210',
  user_email = 'john.doe@example.com',
  updated_at = NOW()
WHERE id = '23dd43a2-2e5e-4ddf-b2a3-73dc39c92c96';

-- Check if the update worked
SELECT 
  id,
  post_id,
  user_name,
  user_phone,
  user_email,
  contact_preference,
  status,
  updated_at
FROM contact_unlock_requests 
WHERE id = '23dd43a2-2e5e-4ddf-b2a3-73dc39c92c96';
