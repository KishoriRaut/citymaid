-- ============================================================================
-- MINIMAL DATABASE SETUP FOR CITYMAID (WITH PROFILES)
-- ============================================================================
-- Run this script in your Supabase SQL Editor to fix missing tables
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- POSTS TABLE
-- ============================================================================

-- Drop posts table if it exists
DROP TABLE IF EXISTS public.posts CASCADE;

-- Create posts table
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
    employee_photo TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_post_type ON public.posts(post_type);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);

-- ============================================================================
-- PAYMENTS TABLE
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

-- Create indexes
CREATE INDEX idx_payments_post_id ON public.payments(post_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_visitor_id ON public.payments(visitor_id);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- ============================================================================
-- CONTACT UNLOCK REQUESTS TABLE
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

-- Create indexes
CREATE INDEX idx_contact_unlock_post_id ON public.contact_unlock_requests(post_id);
CREATE INDEX idx_contact_unlock_status ON public.contact_unlock_requests(status);
CREATE INDEX idx_contact_unlock_visitor_id ON public.contact_unlock_requests(visitor_id);
CREATE INDEX idx_contact_unlock_created_at ON public.contact_unlock_requests(created_at DESC);

-- ============================================================================
-- USERS TABLE (Local admin users)
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

-- Create index
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================================
-- PROFILES TABLE (For Supabase Auth users)
-- ============================================================================

-- Drop profiles table if it exists
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_profiles_email ON public.profiles(email);

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

-- Create triggers for updated_at
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

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'kishoriraut369@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_unlock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users policy" ON public.users;
DROP POLICY IF EXISTS "Posts policy" ON public.posts;
DROP POLICY IF EXISTS "Payments policy" ON public.payments;
DROP POLICY IF EXISTS "Contact unlock requests policy" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Profiles policy" ON public.profiles;

-- Simple policies
CREATE POLICY "Users policy" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Posts policy" ON public.posts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Payments policy" ON public.payments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Contact unlock requests policy" ON public.contact_unlock_requests
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Profiles policy" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- PUBLIC FUNCTIONS
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;

-- ============================================================================
-- ADMIN SETUP
-- ============================================================================

-- Update existing admin user if exists
UPDATE profiles 
SET role = 'admin'
WHERE email = 'kishoriraut369@gmail.com';

-- Insert admin profile if user exists but profile doesn't
INSERT INTO public.profiles (id, email, role)
SELECT 
  id, 
  email, 
  'admin'
FROM auth.users 
WHERE email = 'kishoriraut369@gmail.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'kishoriraut369@gmail.com');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Database setup completed successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('posts', 'payments', 'contact_unlock_requests', 'users', 'profiles');
