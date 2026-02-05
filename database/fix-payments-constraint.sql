-- Fix payments table constraint to allow 'hidden' status
-- Run this in your Supabase SQL Editor

-- First, check the current constraint
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.payments' 
AND contype = 'c';

-- Drop the existing check constraint if it exists
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- Add the updated check constraint that allows all valid statuses
ALTER TABLE payments 
ADD CONSTRAINT payments_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'hidden'));

-- Verify the constraint was added
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.payments' 
AND contype = 'c'
AND conname = 'payments_status_check';

-- Test the constraint by trying to update a payment
-- This should work now
UPDATE payments 
SET status = 'hidden' 
WHERE status = 'approved' 
LIMIT 1;

-- Rollback the test (optional)
-- UPDATE payments SET status = 'approved' WHERE status = 'hidden' LIMIT 1;

-- Verify all payment statuses
SELECT DISTINCT status FROM payments ORDER BY status;
