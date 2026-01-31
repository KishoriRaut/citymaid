-- Debug: Check if unlock contact requests are being created properly
-- Run this in Supabase SQL Editor

-- Check recent contact unlock requests with all fields
SELECT 
  cur.id,
  cur.post_id,
  cur.user_name,
  cur.user_phone, 
  cur.user_email,
  cur.contact_preference,
  cur.status,
  cur.payment_proof,
  cur.created_at,
  cur.delivery_status,
  cur.delivery_notes,
  p.work,
  p.place,
  p.status as post_status
FROM contact_unlock_requests cur
JOIN posts p ON cur.post_id = p.id
ORDER BY cur.created_at DESC
LIMIT 10;

-- Check if any requests exist at all
SELECT COUNT(*) as total_unlock_requests FROM contact_unlock_requests;

-- Check recent requests (last 24 hours)
SELECT 
  COUNT(*) as recent_requests,
  COUNT(CASE WHEN user_name IS NOT NULL THEN 1 END) as with_name,
  COUNT(CASE WHEN user_phone IS NOT NULL THEN 1 END) as with_phone,
  COUNT(CASE WHEN user_email IS NOT NULL THEN 1 END) as with_email
FROM contact_unlock_requests 
WHERE created_at >= NOW() - INTERVAL '24 hours';
