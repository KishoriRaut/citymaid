-- ============================================================================
-- Add Employee Photo Column Migration
-- ============================================================================
-- This migration adds a separate column for employee photos
-- so they can be visible before approval, separate from payment receipts
-- ============================================================================

-- Add employee_photo column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS employee_photo TEXT;

-- Add comment to explain the purpose
COMMENT ON COLUMN public.posts.employee_photo IS 'Employee profile photo visible before approval (only for employee posts)';

-- Update existing posts: move employee photos from photo_url to employee_photo for employee posts
UPDATE public.posts 
SET employee_photo = photo_url 
WHERE post_type = 'employee' AND photo_url IS NOT NULL;

-- Clear photo_url for employee posts since it should only contain payment receipt
UPDATE public.posts 
SET photo_url = NULL 
WHERE post_type = 'employee' AND employee_photo IS NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_employee_photo ON public.posts(employee_photo) WHERE employee_photo IS NOT NULL;

-- Verify the changes
SELECT 
    id,
    post_type,
    photo_url IS NOT NULL as has_payment_receipt,
    employee_photo IS NOT NULL as has_employee_photo,
    status
FROM public.posts 
WHERE post_type = 'employee'
LIMIT 5;
