-- ============================================================================
-- Migration: Add customer_name and receipt_url to payments table
-- ============================================================================
-- Run this migration to add the new verification fields to the payments table
-- This migration is idempotent - safe to run multiple times
-- ============================================================================

-- Add customer_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments' 
    AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN customer_name TEXT;
  END IF;
END $$;

-- Add receipt_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments' 
    AND column_name = 'receipt_url'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN receipt_url TEXT;
  END IF;
END $$;

-- Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'payments'
  AND column_name IN ('customer_name', 'receipt_url')
ORDER BY column_name;
