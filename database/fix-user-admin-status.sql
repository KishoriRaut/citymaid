-- Fix User Admin Status - Remove from users table to become regular user
-- Run this in Supabase SQL Editor

-- First, check if you're in the users table
SELECT * FROM users WHERE email = 'your-email@example.com';

-- Remove your email from users table to make you a regular user
-- Replace 'your-email@example.com' with your actual email
DELETE FROM users WHERE email = 'your-email@example.com';

-- Verify removal
SELECT * FROM users WHERE email = 'your-email@example.com';

-- Update existing posts to pending (optional - only if you want to re-approve them)
-- UPDATE posts SET status = 'pending' WHERE contact = 'your-contact-info';

-- Note: After running this, your new posts will require admin approval
-- and will show "Approve" button in admin dashboard
