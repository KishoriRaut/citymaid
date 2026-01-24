-- ============================================================================
-- Add Homepage Payment Feature to Posts Table
-- ============================================================================
-- This adds a homepage payment status column to control homepage visibility
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Add homepage_payment_status column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS homepage_payment_status TEXT DEFAULT 'none';

-- Step 2: Add check constraint for allowed values
ALTER TABLE public.posts 
ADD CONSTRAINT homepage_payment_status_check 
CHECK (homepage_payment_status IN ('none', 'pending', 'approved', 'rejected'));

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_posts_homepage_payment_status 
ON public.posts(homepage_payment_status);

-- Step 4: Update existing posts to have 'none' as default (in case any have NULL)
UPDATE public.posts 
SET homepage_payment_status = 'none' 
WHERE homepage_payment_status IS NULL;

-- Step 5: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'posts'
AND column_name = 'homepage_payment_status';

-- Step 6: Show sample data to verify
SELECT 
    id, 
    status, 
    homepage_payment_status,
    created_at
FROM public.posts 
ORDER BY created_at DESC 
LIMIT 5;
