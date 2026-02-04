-- Fix missing columns in posts table
-- Run this in your production Supabase SQL Editor

-- Add missing homepage_payment_status column
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS homepage_payment_status TEXT 
DEFAULT 'unpaid' 
CHECK (homepage_payment_status IN ('unpaid', 'paid', 'free'));

-- Also add other potentially missing columns that might be referenced
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS details TEXT,
ADD COLUMN IF NOT EXISTS employee_photo TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Verify all columns now exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'posts'
ORDER BY ordinal_position;
