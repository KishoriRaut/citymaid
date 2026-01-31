-- ============================================================================
-- Check for Older/Payment Records - Debug Missing Data
-- ============================================================================
-- Run this in Supabase SQL Editor to see if there are older records
-- ============================================================================

-- Check total counts in both tables
SELECT 'Payments Table' as table_name, COUNT(*) as total_records FROM public.payments
UNION ALL
SELECT 'Contact Unlock Requests' as table_name, COUNT(*) as total_records FROM public.contact_unlock_requests;

-- Check date ranges for payments
SELECT 
    'Payments Date Range' as info,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record,
    COUNT(*) as total_count
FROM public.payments;

-- Check date ranges for unlock requests
SELECT 
    'Unlock Requests Date Range' as info,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record,
    COUNT(*) as total_count
FROM public.contact_unlock_requests;

-- Show oldest 5 payment records
SELECT 
    'Oldest 5 Payments' as info,
    id,
    status,
    created_at,
    post_id
FROM public.payments
ORDER BY created_at ASC
LIMIT 5;

-- Show newest 5 payment records
SELECT 
    'Newest 5 Payments' as info,
    id,
    status,
    created_at,
    post_id
FROM public.payments
ORDER BY created_at DESC
LIMIT 5;

-- Show oldest 5 unlock request records
SELECT 
    'Oldest 5 Unlock Requests' as info,
    id,
    status,
    created_at,
    post_id
FROM public.contact_unlock_requests
ORDER BY created_at ASC
LIMIT 5;

-- Show newest 5 unlock request records
SELECT 
    'Newest 5 Unlock Requests' as info,
    id,
    status,
    created_at,
    post_id
FROM public.contact_unlock_requests
ORDER BY created_at DESC
LIMIT 5;
