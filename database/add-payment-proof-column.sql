-- ============================================================================
-- Add Payment Proof Column to Posts Table
-- ============================================================================
-- This adds a payment_proof column to store payment proof URLs
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Add payment_proof column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS payment_proof TEXT;

-- Step 2: Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'posts'
AND column_name = 'payment_proof';

-- Step 3: Show sample data to verify
SELECT 
    id, 
    status, 
    homepage_payment_status,
    payment_proof,
    created_at
FROM public.posts 
ORDER BY created_at DESC 
LIMIT 5;
