-- Check current payment-receipts bucket contents
-- Run this in Supabase SQL Editor

-- List all objects in payment-receipts bucket
SELECT 
  name,
  created_at,
  updated_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'payment-receipts'
ORDER BY created_at DESC;

-- Check payment records with receipt URLs
SELECT 
  p.id,
  p.post_id,
  p.receipt_url,
  p.status,
  p.payment_type,
  p.created_at,
  po.work,
  po.post_type
FROM payments p
JOIN posts po ON p.post_id = po.id
WHERE p.receipt_url IS NOT NULL
ORDER BY p.created_at DESC;

-- Check contact unlock requests with payment proofs
SELECT 
  cur.id,
  cur.post_id,
  cur.payment_proof,
  cur.status,
  cur.created_at,
  po.work,
  po.post_type
FROM contact_unlock_requests cur
JOIN posts po ON cur.post_id = po.id
WHERE cur.payment_proof IS NOT NULL
ORDER BY cur.created_at DESC;
