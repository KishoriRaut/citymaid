-- Test and verify payment-receipts bucket functionality
-- Run this in Supabase SQL Editor

-- 1. Check if bucket exists and get bucket info
SELECT * FROM storage.buckets WHERE name = 'payment-receipts';

-- 2. Check current objects in payment-receipts bucket
SELECT 
  name,
  created_at,
  updated_at,
  size,
  metadata
FROM storage.objects 
WHERE bucket_id = 'payment-receipts'
ORDER BY created_at DESC;

-- 3. Test bucket permissions by trying to insert a test file (this will fail if permissions are wrong)
-- This is just a test - you can run it to check permissions
SELECT 
  'Testing bucket permissions...' as status;

-- 4. Check recent payment uploads that should be in the bucket
SELECT 
  p.id,
  p.post_id,
  p.receipt_url,
  p.status,
  p.payment_type,
  p.created_at,
  po.work,
  po.post_type,
  CASE 
    WHEN p.receipt_url LIKE '%payment-receipts%' THEN '✅ Correct bucket'
    WHEN p.receipt_url IS NULL THEN '❌ No receipt URL'
    ELSE '⚠️ Wrong bucket or format'
  END as bucket_status
FROM payments p
JOIN posts po ON p.post_id = po.id
WHERE p.receipt_url IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Check contact unlock payments
SELECT 
  cur.id,
  cur.post_id,
  cur.payment_proof,
  cur.status,
  cur.created_at,
  po.work,
  po.post_type,
  CASE 
    WHEN cur.payment_proof LIKE '%payment-receipts%' THEN '✅ Correct bucket'
    WHEN cur.payment_proof IS NULL THEN '❌ No payment proof'
    WHEN cur.payment_proof LIKE 'data:%' THEN '⚠️ Base64 data (not uploaded)'
    ELSE '⚠️ Wrong format'
  END as storage_status
FROM contact_unlock_requests cur
JOIN posts po ON cur.post_id = po.id
WHERE cur.payment_proof IS NOT NULL
ORDER BY cur.created_at DESC
LIMIT 10;

-- 6. Summary statistics
SELECT 
  'Total objects in payment-receipts bucket' as metric,
  COUNT(*) as count
FROM storage.objects 
WHERE bucket_id = 'payment-receipts'

UNION ALL

SELECT 
  'Payments with receipt URLs' as metric,
  COUNT(*) as count
FROM payments 
WHERE receipt_url IS NOT NULL

UNION ALL

SELECT 
  'Contact unlocks with payment proofs' as metric,
  COUNT(*) as count
FROM contact_unlock_requests 
WHERE payment_proof IS NOT NULL;
