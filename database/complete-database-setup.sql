-- ============================================================================
-- COMPLETE DATABASE SETUP FOR CITYMAID
-- ============================================================================
-- Run this script in your Supabase SQL Editor to fix missing tables
-- This will create all necessary tables with proper structure
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- POSTS TABLE (Main table for job postings)
-- ============================================================================

-- Drop posts table if it exists to start fresh
DROP TABLE IF EXISTS public.posts CASCADE;

-- Create posts table with all required columns
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_type TEXT NOT NULL CHECK (post_type IN ('employer', 'employee')),
    work TEXT NOT NULL,
    "time" TEXT NOT NULL,
    place TEXT NOT NULL,
    salary TEXT NOT NULL,
    contact TEXT NOT NULL,
    details TEXT,
    photo_url TEXT,
    employee_photo TEXT, -- Separate field for employee photos
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_post_type ON public.posts(post_type);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);

-- Enable Row Level Security on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PAYMENTS TABLE (For post approval payments)
-- ============================================================================

-- Drop payments table if it exists
DROP TABLE IF EXISTS public.payments CASCADE;

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    visitor_id TEXT,
    amount INTEGER DEFAULT 399,
    method TEXT NOT NULL CHECK (method IN ('qr', 'esewa', 'bank')),
    reference_id TEXT,
    customer_name TEXT,
    receipt_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for payments
CREATE INDEX idx_payments_post_id ON public.payments(post_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_visitor_id ON public.payments(visitor_id);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- Enable Row Level Security on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CONTACT UNLOCK REQUESTS TABLE (For contact access payments)
-- ============================================================================

-- Drop contact_unlock_requests table if it exists
DROP TABLE IF EXISTS public.contact_unlock_requests CASCADE;

-- Create contact_unlock_requests table
CREATE TABLE public.contact_unlock_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    user_email TEXT,
    contact_preference TEXT DEFAULT 'phone',
    payment_proof TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for contact unlock requests
CREATE INDEX idx_contact_unlock_post_id ON public.contact_unlock_requests(post_id);
CREATE INDEX idx_contact_unlock_status ON public.contact_unlock_requests(status);
CREATE INDEX idx_contact_unlock_visitor_id ON public.contact_unlock_requests(visitor_id);
CREATE INDEX idx_contact_unlock_created_at ON public.contact_unlock_requests(created_at DESC);

-- Enable Row Level Security on contact_unlock_requests table
ALTER TABLE public.contact_unlock_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE (Admin users)
-- ============================================================================

-- Drop users table if it exists
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON public.users(email);

-- Enable Row Level Security on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updated_at updates
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_unlock_updated_at ON public.contact_unlock_requests;
CREATE TRIGGER update_contact_unlock_updated_at
    BEFORE UPDATE ON public.contact_unlock_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Allow public signup" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert" ON public.users;

DROP POLICY IF EXISTS "Public can read approved posts" ON public.posts;
DROP POLICY IF EXISTS "Public can insert posts as pending" ON public.posts;
DROP POLICY IF EXISTS "Service role has full access to posts" ON public.posts;

DROP POLICY IF EXISTS "Public can insert payments as pending" ON public.payments;
DROP POLICY IF EXISTS "Public can read own approved payments" ON public.payments;
DROP POLICY IF EXISTS "Service role has full access to payments" ON public.payments;

DROP POLICY IF EXISTS "Public can insert contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Public can read own contact unlock requests" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Service role has full access to contact unlock requests" ON public.contact_unlock_requests;

-- Users table policies (admin only)
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Posts table policies
CREATE POLICY "Public can insert posts as pending" ON public.posts
    FOR INSERT
    WITH CHECK (status = 'pending');

CREATE POLICY "Service role has full access to posts" ON public.posts
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Payments table policies
CREATE POLICY "Public can insert payments as pending" ON public.payments
    FOR INSERT
    WITH CHECK (status = 'pending');

CREATE POLICY "Public can read own approved payments" ON public.payments
    FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Service role has full access to payments" ON public.payments
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Contact unlock requests policies
CREATE POLICY "Public can insert contact unlock requests" ON public.contact_unlock_requests
    FOR INSERT
    WITH CHECK (status = 'pending');

CREATE POLICY "Public can read own contact unlock requests" ON public.contact_unlock_requests
    FOR SELECT
    USING (visitor_id = current_setting('app.current_visitor_id', ''));

CREATE POLICY "Service role has full access to contact unlock requests" ON public.contact_unlock_requests
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- SECURE FUNCTIONS
-- ============================================================================

-- Function to get public posts with contact protection
CREATE OR REPLACE FUNCTION public.get_public_posts()
RETURNS TABLE (
    id UUID,
    post_type TEXT,
    work TEXT,
    "time" TEXT,
    place TEXT,
    salary TEXT,
    contact TEXT,
    details TEXT,
    photo_url TEXT,
    employee_photo TEXT,
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
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.payments pay
                WHERE pay.post_id = p.id 
                AND pay.status = 'approved'
            ) THEN p.contact
            ELSE NULL
        END AS contact,
        p.details,
        -- Use appropriate photo based on post type
        CASE 
            WHEN p.post_type = 'employee' THEN p.employee_photo
            ELSE p.photo_url
        END AS photo_url,
        p.employee_photo,
        p.status,
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'
        AND p.created_at >= now() - interval '30 days'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- ============================================================================
-- STORAGE BUCKETS (Manual setup may be required)
-- ============================================================================

-- Try to create storage buckets (may fail - create manually in Dashboard if needed)
DO $$
BEGIN
  -- Create post-photos bucket
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('post-photos', 'post-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  ON CONFLICT (id) DO NOTHING;
  
  -- Create payment-proofs bucket
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('payment-proofs', 'payment-proofs', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Cannot create buckets via SQL. Please create buckets manually in Dashboard > Storage.';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating buckets: %. Please create buckets manually in Dashboard > Storage.', SQLERRM;
END $$;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public can upload post photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read post photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Public can read payment proofs" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public can upload post photos" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'post-photos');

CREATE POLICY "Public can read post photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-photos');

CREATE POLICY "Public can upload payment proofs" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Public can read payment proofs" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'payment-proofs');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show created tables
SELECT 'Tables created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('posts', 'payments', 'contact_unlock_requests', 'users');

-- Show created functions
SELECT 'Functions created successfully' as status;
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_public_posts';

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
