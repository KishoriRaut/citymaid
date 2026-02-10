-- ============================================================================
-- FIX RLS POLICIES FOR POST INSERTION (CORRECTED SYNTAX)
-- ============================================================================
-- Run this to allow public post creation without permission issues
-- ============================================================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users policy" ON public.users;
DROP POLICY IF EXISTS "Posts policy" ON public.posts;
DROP POLICY IF EXISTS "Payments policy" ON public.payments;
DROP POLICY IF EXISTS "Contact unlock requests policy" ON public.contact_unlock_requests;
DROP POLICY IF EXISTS "Profiles policy" ON public.profiles;

-- Simple permissive policies
CREATE POLICY "Users policy" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Posts policy" ON public.posts
    FOR INSERT WITH CHECK (status = 'pending')
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Payments policy" ON public.payments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Contact unlock requests policy" ON public.contact_unlock_requests
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Profiles policy" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

SELECT 'RLS policies updated with correct syntax' as status;
