-- Clean up orphaned contact information in contact_unlock_requests
-- Run this in Supabase SQL Editor to fix existing data

-- First, let's see how many orphaned records we have
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN payment_proof IS NULL THEN 1 END) as without_payment_proof,
    COUNT(CASE WHEN payment_proof IS NULL AND (user_name IS NOT NULL OR user_phone IS NOT NULL OR user_email IS NOT NULL) THEN 1 END) as orphaned_contact_info
FROM contact_unlock_requests;

-- Show sample of orphaned records
SELECT 
    id,
    visitor_id,
    status,
    payment_proof,
    user_name,
    user_phone,
    user_email,
    contact_preference,
    created_at
FROM contact_unlock_requests 
WHERE payment_proof IS NULL 
  AND (user_name IS NOT NULL OR user_phone IS NOT NULL OR user_email IS NOT NULL)
ORDER BY created_at DESC
LIMIT 10;

-- Clean up orphaned records - remove contact info if no payment proof exists
UPDATE contact_unlock_requests 
SET 
  user_name = NULL,
  user_phone = NULL,
  user_email = NULL,
  contact_preference = NULL,
  updated_at = NOW()
WHERE payment_proof IS NULL 
  AND (user_name IS NOT NULL OR user_phone IS NOT NULL OR user_email IS NOT NULL);

-- Verify the cleanup
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN payment_proof IS NULL THEN 1 END) as without_payment_proof,
    COUNT(CASE WHEN payment_proof IS NULL AND (user_name IS NOT NULL OR user_phone IS NOT NULL OR user_email IS NOT NULL) THEN 1 END) as orphaned_contact_info_after_cleanup
FROM contact_unlock_requests;

-- Show final state of recent requests
SELECT 
    id,
    status,
    CASE 
        WHEN payment_proof IS NOT NULL THEN 'YES'
        ELSE 'NO'
    END as has_payment_proof,
    CASE 
        WHEN (user_name IS NOT NULL OR user_phone IS NOT NULL OR user_email IS NOT NULL) THEN 'YES'
        ELSE 'NO'
    END as has_contact_info,
    created_at
FROM contact_unlock_requests 
ORDER BY created_at DESC
LIMIT 10;
