-- Check actual payment proof URLs in the database
SELECT 
    'payments' as table_name,
    id,
    receipt_url,
    status,
    created_at
FROM payments 
WHERE receipt_url IS NOT NULL 
AND receipt_url != ''
UNION ALL
SELECT 
    'contact_unlock_requests' as table_name,
    id,
    payment_proof as receipt_url,
    status,
    created_at
FROM contact_unlock_requests 
WHERE payment_proof IS NOT NULL 
AND payment_proof != ''
ORDER BY created_at DESC
LIMIT 10;
