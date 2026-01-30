-- Debug Restaurant Helper post payment data
-- Run this in Supabase SQL Editor

-- Find the Restaurant Helper post and its payment data
SELECT 
  p.id as post_id,
  p.work,
  p.status as post_status,
  p.homepage_payment_status,
  p.payment_proof as post_payment_proof,
  -- Homepage payments
  (SELECT json_agg(
    json_build_object(
      'id', hp.id,
      'receipt_url', hp.receipt_url,
      'status', hp.status,
      'payment_type', hp.payment_type,
      'created_at', hp.created_at
    )
  ) FROM payments hp WHERE hp.post_id = p.id) as homepage_payments,
  -- Contact unlock requests
  (SELECT json_agg(
    json_build_object(
      'id', cur.id,
      'payment_proof', cur.payment_proof,
      'status', cur.status,
      'created_at', cur.created_at
    )
  ) FROM contact_unlock_requests cur WHERE cur.post_id = p.id) as contact_unlocks
FROM posts p
WHERE p.id = '2255344d-10b6-4cd0-8c2c-34dccd358aff'
   OR p.work LIKE '%Restaurant Helper%';

-- Check specific payment records for this post
SELECT 
  'payments' as table_name,
  id,
  post_id,
  receipt_url,
  status,
  payment_type,
  created_at
FROM payments 
WHERE post_id = '2255344d-10b6-4cd0-8c2c-34dccd358aff'

UNION ALL

SELECT 
  'contact_unlock_requests' as table_name,
  id,
  post_id,
  payment_proof as receipt_url,
  status,
  'contact_unlock' as payment_type,
  created_at
FROM contact_unlock_requests 
WHERE post_id = '2255344d-10b6-4cd0-8c2c-34dccd358aff';
