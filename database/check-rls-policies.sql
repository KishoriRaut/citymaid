-- Check RLS policies for payment-related tables
-- Run this in Supabase SQL Editor

-- Check RLS status for contact_unlock_requests
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('contact_unlock_requests', 'posts', 'payments');

-- Check policies on contact_unlock_requests
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('contact_unlock_requests', 'posts', 'payments')
ORDER BY tablename, policyname;

-- Test if admin can access contact_unlock_requests
-- This simulates what the admin should be able to see
SELECT 
    'contact_unlock_requests' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN payment_proof IS NOT NULL THEN 1 END) as records_with_payment_proof
FROM contact_unlock_requests;

-- Test admin access to posts with payment data
SELECT 
    'posts' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN homepage_payment_status != 'none' THEN 1 END) as records_with_payment_status,
    COUNT(CASE WHEN payment_proof IS NOT NULL THEN 1 END) as records_with_payment_proof
FROM posts;
