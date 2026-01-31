-- Debug: Check existing contact unlock requests
-- Run this in Supabase SQL Editor

-- Check if there are any contact unlock requests
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
  p.work,
  p.place,
  p.status as post_status
FROM contact_unlock_requests cur
JOIN posts p ON cur.post_id = p.id
ORDER BY cur.created_at DESC
LIMIT 10;

-- Check posts table to see if posts have contact_unlock_requests
SELECT 
  p.id,
  p.work,
  p.place,
  COUNT(cur.id) as unlock_request_count
FROM posts p
LEFT JOIN contact_unlock_requests cur ON p.id = cur.post_id
GROUP BY p.id, p.work, p.place
ORDER BY unlock_request_count DESC
LIMIT 10;
