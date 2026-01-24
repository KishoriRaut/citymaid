-- ============================================================================
-- Fix Schema Cache Issue - Complete Column Recreation
-- ============================================================================
-- This will completely recreate the homepage payment columns
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Drop existing columns completely
ALTER TABLE public.posts DROP COLUMN IF EXISTS homepage_payment_status;
ALTER TABLE public.posts DROP COLUMN IF EXISTS payment_proof;

-- Step 2: Add columns fresh
ALTER TABLE public.posts ADD COLUMN homepage_payment_status TEXT DEFAULT 'none';
ALTER TABLE public.posts ADD COLUMN payment_proof TEXT;

-- Step 3: Add constraint
ALTER TABLE public.posts 
ADD CONSTRAINT homepage_payment_status_check 
CHECK (homepage_payment_status IN ('none', 'pending', 'approved', 'rejected'));

-- Step 4: Create index for performance
CREATE INDEX IF NOT EXISTS idx_posts_homepage_payment_status 
ON public.posts(homepage_payment_status);

-- Step 5: Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- Step 6: Verify columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'posts'
AND column_name IN ('homepage_payment_status', 'payment_proof')
ORDER BY column_name;

-- Step 7: Show sample data
SELECT 
    id, 
    status, 
    homepage_payment_status,
    payment_proof,
    created_at
FROM public.posts 
ORDER BY created_at DESC 
LIMIT 3;
