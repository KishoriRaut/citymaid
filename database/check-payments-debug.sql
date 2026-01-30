-- Debug script to check payment data across all tables
-- Run this in Supabase SQL Editor

-- Step 1: Check posts table for payment columns
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'posts'
AND column_name IN ('homepage_payment_status', 'payment_proof');

-- Step 2: Check posts table data
SELECT 
    id, 
    work,
    status, 
    homepage_payment_status,
    payment_proof,
    created_at
FROM public.posts 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 3: Check payments table (homepage payments)
SELECT 
    id,
    post_id,
    payment_type,
    status,
    receipt_url,
    created_at
FROM public.payments 
WHERE payment_type = 'post_promotion'
ORDER BY created_at DESC 
LIMIT 5;

-- Step 4: Check contact_unlock_requests table (contact unlock payments)
SELECT 
    id,
    post_id,
    visitor_id,
    status,
    payment_proof,
    created_at
FROM public.contact_unlock_requests 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 5: Count all payment-related records
SELECT 
    'posts' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN homepage_payment_status != 'none' THEN 1 END) as has_payment_status,
    COUNT(CASE WHEN payment_proof IS NOT NULL THEN 1 END) as has_payment_proof
FROM public.posts

UNION ALL

SELECT 
    'payments' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status != 'none' THEN 1 END) as has_payment_status,
    COUNT(CASE WHEN receipt_url IS NOT NULL THEN 1 END) as has_payment_proof
FROM public.payments

UNION ALL

SELECT 
    'contact_unlock_requests' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status != 'pending' THEN 1 END) as has_payment_status,
    COUNT(CASE WHEN payment_proof IS NOT NULL THEN 1 END) as has_payment_proof
FROM public.contact_unlock_requests;
