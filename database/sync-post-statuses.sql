-- Sync Post Statuses - Fix posts that are approved in payments but not in posts table
-- Run this in your Supabase SQL Editor

-- Step 1: Show current status
SELECT 'Current Status Check' as step;
SELECT 
    'Payments Table' as table_name,
    COUNT(*) as total_payments,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_payments
FROM payments
UNION ALL
SELECT 
    'Posts Table' as table_name,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_posts
FROM posts;

-- Step 2: Find posts that need to be synchronized
SELECT 'Posts Needing Sync' as step;
SELECT 
    p.id as post_id,
    p.status as posts_status,
    py.status as payments_status,
    p.work,
    p.place
FROM posts p
LEFT JOIN payments py ON p.id = py.post_id
WHERE py.status = 'approved' AND p.status != 'approved'
ORDER BY p.created_at DESC;

-- Step 3: Update posts table to match payments table
UPDATE posts 
SET status = 'approved'
WHERE id IN (
    SELECT p.id
    FROM posts p
    LEFT JOIN payments py ON p.id = py.post_id
    WHERE py.status = 'approved' AND p.status != 'approved'
);

-- Step 4: Update posts table to match hidden status in payments
UPDATE posts 
SET status = 'hidden'
WHERE id IN (
    SELECT p.id
    FROM posts p
    LEFT JOIN payments py ON p.id = py.post_id
    WHERE py.status = 'hidden' AND p.status != 'hidden'
);

-- Step 5: Show final status
SELECT 'Final Status After Sync' as step;
SELECT 
    'Payments Table' as table_name,
    COUNT(*) as total_payments,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_payments
FROM payments
UNION ALL
SELECT 
    'Posts Table' as table_name,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_posts
FROM posts;

-- Step 6: Verify specific posts are now visible
SELECT 'Sample Approved Posts Now Visible' as step;
SELECT 
    id,
    work,
    place,
    status,
    created_at
FROM posts 
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Post status synchronization completed!' as status, NOW() as completed_at;
