-- Add role column to users table
-- This makes the database the source of truth for admin status

ALTER TABLE public.users
ADD COLUMN role TEXT NOT NULL DEFAULT 'admin';

-- Add index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Update existing users to have admin role (since this is an internal admin table)
UPDATE public.users 
SET role = 'admin' 
WHERE role IS NULL OR role = '';

-- Verify the changes
SELECT id, email, role FROM public.users;
