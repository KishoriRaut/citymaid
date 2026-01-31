-- Check recent contact unlock requests
SELECT 
    id,
    visitor_id,
    status,
    payment_proof,
    created_at,
    updated_at,
    user_name,
    user_phone,
    user_email,
    contact_preference
FROM contact_unlock_requests 
ORDER BY created_at DESC
LIMIT 10;
