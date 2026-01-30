-- Check payment receipt URLs in both tables
-- Run this in Supabase SQL Editor

-- Check payments table receipt URLs
SELECT 
    id,
    post_id,
    receipt_url,
    status,
    created_at
FROM public.payments 
WHERE receipt_url IS NOT NULL
ORDER BY created_at DESC 
LIMIT 5;

-- Check contact_unlock_requests table payment_proof URLs  
SELECT 
    id,
    post_id,
    payment_proof,
    status,
    created_at
FROM public.contact_unlock_requests 
WHERE payment_proof IS NOT NULL
ORDER BY created_at DESC 
LIMIT 5;

-- Check if URLs are full Supabase URLs or relative paths
SELECT 
    'payments' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN receipt_url LIKE 'http%' THEN 1 END) as full_urls,
    COUNT(CASE WHEN receipt_url NOT LIKE 'http%' THEN 1 END) as relative_urls
FROM public.payments 
WHERE receipt_url IS NOT NULL

UNION ALL

SELECT 
    'contact_unlock_requests' as table_name,
    COUNT(*) as total,
    COUNT(CASE WHEN payment_proof LIKE 'http%' THEN 1 END) as full_urls,
    COUNT(CASE WHEN payment_proof NOT LIKE 'http%' THEN 1 END) as relative_urls
FROM public.contact_unlock_requests 
WHERE payment_proof IS NOT NULL;
