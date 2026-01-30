-- Debug payment receipt URLs and storage
-- Run this in Supabase SQL Editor

-- Step 1: Check actual objects in payment-receipts bucket
SELECT 
    bucket_id,
    name,
    created_at
FROM storage.objects 
WHERE bucket_id = 'payment-receipts'
ORDER BY created_at DESC;

-- Step 2: Check payment records with receipt URLs
SELECT 
    p.id as payment_id,
    p.post_id,
    p.receipt_url,
    p.status,
    p.created_at
FROM payments p
WHERE p.receipt_url IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 5;

-- Step 3: Check contact_unlock_requests with payment_proof
SELECT 
    cur.id as unlock_id,
    cur.post_id,
    cur.payment_proof,
    cur.status,
    cur.created_at
FROM contact_unlock_requests cur
WHERE cur.payment_proof IS NOT NULL
ORDER BY cur.created_at DESC
LIMIT 5;

-- Step 4: Check if there are any posts with payment data
SELECT 
    po.id,
    po.work,
    po.homepage_payment_status,
    po.payment_proof
FROM posts po
WHERE po.homepage_payment_status != 'none' OR po.payment_proof IS NOT NULL
ORDER BY po.created_at DESC
LIMIT 5;
