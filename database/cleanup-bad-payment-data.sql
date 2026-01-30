-- Clean up bad payment proof data from database
-- Run this in Supabase SQL Editor

-- Step 1: Identify bad payment proof records
SELECT 
    'payments' as table_name,
    id,
    post_id,
    receipt_url,
    status,
    created_at
FROM payments 
WHERE receipt_url LIKE '%payment_proof_%_8b390f9b-95d2-451a-9569-1d30b4daad35_%'
   OR receipt_url LIKE '%payment_proof_%' AND LENGTH(receipt_url) > 100

UNION ALL

SELECT 
    'contact_unlock_requests' as table_name,
    id,
    post_id,
    payment_proof as receipt_url,
    status,
    created_at
FROM contact_unlock_requests 
WHERE payment_proof LIKE '%payment_proof_%_8b390f9b-95d2-451a-9569-1d30b4daad35_%'
   OR payment_proof LIKE '%payment_proof_%' AND LENGTH(payment_proof) > 100;

-- Step 2: Clean up bad records in payments table
UPDATE payments 
SET receipt_url = NULL 
WHERE receipt_url LIKE '%payment_proof_%_8b390f9b-95d2-451a-9569-1d30b4daad35_%'
   OR receipt_url LIKE '%payment_proof_%' AND LENGTH(receipt_url) > 100;

-- Step 3: Clean up bad records in contact_unlock_requests table  
UPDATE contact_unlock_requests 
SET payment_proof = NULL 
WHERE payment_proof LIKE '%payment_proof_%_8b390f9b-95d2-451a-9569-1d30b4daad35_%'
   OR payment_proof LIKE '%payment_proof_%' AND LENGTH(payment_proof) > 100;

-- Step 4: Verify cleanup
SELECT 
    'payments_after_cleanup' as table_name,
    COUNT(*) as bad_records_remaining
FROM payments 
WHERE receipt_url LIKE '%payment_proof_%_8b390f9b-95d2-451a-9569-1d30b4daad35_%'
   OR receipt_url LIKE '%payment_proof_%' AND LENGTH(receipt_url) > 100

UNION ALL

SELECT 
    'contact_unlock_requests_after_cleanup' as table_name,
    COUNT(*) as bad_records_remaining
FROM contact_unlock_requests 
WHERE payment_proof LIKE '%payment_proof_%_8b390f9b-95d2-451a-9569-1d30b4daad35_%'
   OR payment_proof LIKE '%payment_proof_%' AND LENGTH(payment_proof) > 100;
