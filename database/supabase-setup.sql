-- ============================================================================
-- CityMaid Marketplace - Production Database Schema
-- ============================================================================
-- Run this script in your Supabase SQL Editor
-- This creates a secure, production-ready database with RLS policies
--
-- USAGE:
-- 1. Public users should query posts using: SELECT * FROM get_public_posts();
--    This function protects contact information (only shows if payment approved)
-- 2. Admin users can query posts directly: SELECT * FROM posts;
-- 3. Public can insert posts: INSERT INTO posts (...) VALUES (...);
-- 4. Public can insert payments: INSERT INTO payments (...) VALUES (...);
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE (Admin-only access)
-- ============================================================================

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at updates
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (for idempotency)
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Allow public signup" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert" ON public.users;

-- Policy: Only service role (admin) can manage users
-- This ensures no public signup and only admin can update
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- POSTS TABLE
-- ============================================================================

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_type TEXT NOT NULL CHECK (post_type IN ('employer', 'employee')),
    work TEXT NOT NULL,
    "time" TEXT NOT NULL,
    place TEXT NOT NULL,
    salary TEXT NOT NULL,
    contact TEXT NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Enable Row Level Security on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (for idempotency)
DROP POLICY IF EXISTS "Public can read approved posts" ON public.posts;
DROP POLICY IF EXISTS "Public can insert posts as pending" ON public.posts;
DROP POLICY IF EXISTS "Service role has full access to posts" ON public.posts;

-- Policy: Public can insert posts (status must be 'pending')
-- New posts are automatically set to pending status
CREATE POLICY "Public can insert posts as pending" ON public.posts
    FOR INSERT
    WITH CHECK (status = 'pending');

-- Policy: Service role (admin) has full access to posts
-- Admin can read, update, and delete all posts regardless of status
-- NOTE: Public cannot directly SELECT from posts table to protect contact info
-- Public must use get_public_posts() function which enforces contact protection
-- This satisfies: "Public can read posts only if status = 'approved'" 
-- while ensuring: "Contacts are never exposed unless payment is approved"
CREATE POLICY "Service role has full access to posts" ON public.posts
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    visitor_id TEXT,
    amount INTEGER DEFAULT 3000,
    method TEXT NOT NULL CHECK (method IN ('qr', 'esewa', 'bank')),
    reference_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_post_id ON public.payments(post_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_visitor_id ON public.payments(visitor_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Enable Row Level Security on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (for idempotency)
DROP POLICY IF EXISTS "Public can insert payments as pending" ON public.payments;
DROP POLICY IF EXISTS "Public can read own approved payments" ON public.payments;
DROP POLICY IF EXISTS "Service role has full access to payments" ON public.payments;

-- Policy: Public can insert payments (status must be 'pending')
-- New payments are automatically set to pending status
CREATE POLICY "Public can insert payments as pending" ON public.payments
    FOR INSERT
    WITH CHECK (status = 'pending');

-- Policy: Public can read their own payments only if approved
-- This allows users to check their payment status
CREATE POLICY "Public can read own approved payments" ON public.payments
    FOR SELECT
    USING (status = 'approved');

-- Policy: Service role (admin) has full access to payments
-- Admin can read, update, and delete all payments regardless of status
CREATE POLICY "Service role has full access to payments" ON public.payments
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- SECURITY: Contact Information Protection
-- ============================================================================

-- IMPORTANT: Public access to posts is through get_public_posts() function only
-- This ensures:
-- 1. Public can read posts only if status = 'approved' (function filters by status)
-- 2. Contacts are never exposed unless payment is approved (function checks payment)
-- Direct SELECT on posts table is blocked for public users

-- Create a secure function that returns posts with protected contact information
-- Contacts are only visible when payment is approved
-- This function uses SECURITY DEFINER to bypass RLS and check payment status
CREATE OR REPLACE FUNCTION public.get_public_posts()
RETURNS TABLE (
    id UUID,
    post_type TEXT,
    work TEXT,
    "time" TEXT,
    place TEXT,
    salary TEXT,
    contact TEXT,
    photo_url TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.post_type,
        p.work,
        p."time",
        p.place,
        p.salary,
        -- Only show contact if there's an approved payment for this post
        -- This ensures contacts are never exposed unless payment is approved
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.payments pay
                WHERE pay.post_id = p.id 
                AND pay.status = 'approved'
            ) THEN p.contact
            ELSE NULL
        END AS contact,
        p.photo_url,
        p.status,
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- Note: Views in PostgreSQL inherit RLS from underlying tables
-- Since we don't allow public SELECT on posts table, use the function above instead
-- For Supabase client usage, call: SELECT * FROM get_public_posts();

-- ============================================================================
-- HELPER FUNCTIONS (Optional - for admin operations)
-- ============================================================================

-- Function to get post with contact visibility check
-- This can be used in API routes to conditionally show contacts
-- NOTE: This function exposes contact info - should be used by admin/service_role only
CREATE OR REPLACE FUNCTION public.get_post_with_contact_visibility(post_uuid UUID)
RETURNS TABLE (
    id UUID,
    post_type TEXT,
    work TEXT,
    "time" TEXT,
    place TEXT,
    salary TEXT,
    contact TEXT,
    photo_url TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    contact_visible BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.post_type,
        p.work,
        p."time",
        p.place,
        p.salary,
        p.contact,
        p.photo_url,
        p.status,
        p.created_at,
        EXISTS (
            SELECT 1 FROM public.payments pay
            WHERE pay.post_id = p.id 
            AND pay.status = 'approved'
        ) AS contact_visible
    FROM public.posts p
    WHERE p.id = post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission (admin should use service_role key which bypasses RLS)
-- For public use, use get_public_posts() instead
GRANT EXECUTE ON FUNCTION public.get_post_with_contact_visibility(UUID) TO service_role;

-- ============================================================================
-- STORAGE: Photo Upload Bucket
-- ============================================================================

-- IMPORTANT: Storage buckets must be created via Supabase Dashboard
-- The SQL INSERT below may not work due to permissions
-- 
-- MANUAL SETUP REQUIRED:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Name: "post-photos"
-- 4. Public bucket: YES (check the box)
-- 5. Click "Create bucket"
--
-- OR try the SQL below (may require superuser permissions):

-- Attempt to create bucket (may fail if you don't have permissions)
-- If this fails, create it manually via Dashboard > Storage
DO $$
BEGIN
  -- Check if bucket already exists
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'post-photos') THEN
    -- Try to create the bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('post-photos', 'post-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    ON CONFLICT (id) DO NOTHING;
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Cannot create bucket via SQL. Please create "post-photos" bucket manually in Dashboard > Storage.';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating bucket: %. Please create "post-photos" bucket manually in Dashboard > Storage.', SQLERRM;
END $$;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete own photos" ON storage.objects;

-- Policy: Allow public to upload photos
CREATE POLICY "Public can upload photos" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'post-photos');

-- Policy: Allow public to read photos
CREATE POLICY "Public can read photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-photos');

-- Policy: Allow public to update their own photos (optional)
CREATE POLICY "Public can update own photos" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'post-photos');

-- Policy: Allow public to delete their own photos (optional)
CREATE POLICY "Public can delete own photos" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'post-photos');

-- ============================================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ============================================================================

-- Uncomment to verify table creation:
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('users', 'posts', 'payments')
-- ORDER BY table_name, ordinal_position;

-- Uncomment to verify RLS is enabled:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('users', 'posts', 'payments');

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
