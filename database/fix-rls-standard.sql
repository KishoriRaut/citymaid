-- ============================================================================
-- STANDARD RLS POLICY FIX (SUPABASE COMPATIBLE)
-- ============================================================================
-- Run this to fix RLS policies using standard Supabase syntax
-- ============================================================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users policy" ON public.users;
DROP POLICY IF EXISTS "Posts policy" ON public.posts;
DROP POLICY IF EXISTS "Payments policy" ON public.payments;
DROP POLICY IF EXISTS "Contact unlock requests policy" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Profiles policy" ON public.profiles;

-- Standard Supabase RLS policies
CREATE POLICY "Enable insert for public users" ON public.posts
    FOR INSERT WITH CHECK (status = 'pending')
    TO public;

CREATE POLICY "Enable read for public users" ON public.posts
    FOR SELECT USING (status = 'approved')
    TO public;

CREATE POLICY "Enable all for service role" ON public.posts
    FOR ALL USING (auth.role() = 'service_role')
    TO service_role;

CREATE POLICY "Enable insert for public users" ON public.payments
    FOR INSERT WITH CHECK (status = 'pending')
    TO public;

CREATE POLICY "Enable all for service role" ON public.payments
    FOR ALL USING (auth.role() = 'service_role')
    TO service_role;

CREATE POLICY "Enable insert for public users" ON public.contact_unlock_requests
    FOR INSERT WITH CHECK (status = 'pending')
    TO public;

CREATE POLICY "Enable all for service role" ON public.contact_unlock_requests
    FOR ALL USING (auth.role() = 'service_role')
    TO service_role;

CREATE POLICY "Enable all for service role" ON public.users
    FOR ALL USING (auth.role() = 'service_role')
    TO service_role;

CREATE POLICY "Enable all for service role" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role')
    TO service_role;

SELECT 'Standard RLS policies applied successfully' as status;
