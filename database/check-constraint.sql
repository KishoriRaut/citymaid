-- Check the constraint on contact_preference field
-- Run this in Supabase SQL Editor

-- Check the constraint definition
SELECT 
  conname,
  contype,
  conkey,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'contact_unlock_requests'::regclass 
  AND conname = 'check_contact_preference';

-- Check what values are currently in the contact_preference column
SELECT DISTINCT contact_preference FROM contact_unlock_requests WHERE contact_preference IS NOT NULL;
