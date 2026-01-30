-- Debug payment data for Restaurant Helper post
-- Run this in Supabase SQL Editor

-- Find the Restaurant Helper post
SELECT id, work, status, homepage_payment_status, payment_proof
FROM posts 
WHERE work LIKE '%Restaurant Helper%' OR work LIKE '%Restaurant%';

-- Check payments table for this post
SELECT 
    p.id,
    p.post_id,
    p.receipt_url,
    p.status,
    p.created_at,
    po.work
FROM payments p
JOIN posts po ON p.post_id = po.id
WHERE po.work LIKE '%Restaurant Helper%' OR po.work LIKE '%Restaurant%';

-- Check contact_unlock_requests for this post  
SELECT 
    cur.id,
    cur.post_id,
    cur.payment_proof,
    cur.status,
    cur.created_at,
    po.work
FROM contact_unlock_requests cur
JOIN posts po ON cur.post_id = po.id
WHERE po.work LIKE '%Restaurant Helper%' OR po.work LIKE '%Restaurant%';
