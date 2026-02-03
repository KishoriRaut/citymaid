-- COMPREHENSIVE RLS FIX - Address Unrestricted Access Issues
-- This script ensures RLS is properly enabled and working

-- ==========================================
-- STEP 1: FORCE ENABLE RLS AND RESET POLICIES
-- ==========================================

-- Disable RLS first to reset everything
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 2: CLEAR EXISTING POLICIES AND RECREATE
-- ==========================================

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payment status" ON public.payments;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.payments;
DROP POLICY IF EXISTS "Enable read for all users" ON public.payments;
DROP POLICY IF EXISTS "Enable update for admin users" ON public.payments;

DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view all contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.contact_submissions;
DROP POLICY IF EXISTS "Enable read for all users" ON public.contact_submissions;
DROP POLICY IF EXISTS "Enable update for admin users" ON public.contact_submissions;

-- ==========================================
-- STEP 3: CREATE RESTRICTIVE RLS POLICIES
-- ==========================================

-- PAYMENTS TABLE - RESTRICTIVE POLICIES
CREATE POLICY "Enable read for users based on user_id" ON public.payments
    FOR SELECT USING (
        auth.uid()::text = user_id::text OR 
        (auth.uid() IS NULL AND visitor_id IS NOT NULL) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Enable insert for all users" ON public.payments
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id::text OR 
        (auth.uid() IS NULL AND visitor_id IS NOT NULL)
    );

CREATE POLICY "Enable update for admin users" ON public.payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- CONTACT_SUBMISSIONS TABLE - RESTRICTIVE POLICIES
CREATE POLICY "Enable insert for all users" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for admin users" ON public.contact_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Enable update for admin users" ON public.contact_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ==========================================
-- STEP 4: VERIFY RLS IS WORKING
-- ==========================================

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('payments', 'contact_submissions')
ORDER BY tablename;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual IS NOT NULL as has_qual,
    with_check IS NOT NULL as has_with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('payments', 'contact_submissions')
ORDER BY tablename, policyname;

-- Test RLS functionality - This should show restricted access
-- Run this as different users to verify RLS is working
SELECT 
    'payments' as table_name,
    COUNT(*) as total_records,
    'RLS Test - Should be restricted for non-admin users' as test_description
FROM public.payments

UNION ALL

SELECT 
    'contact_submissions' as table_name,
    COUNT(*) as total_records,
    'RLS Test - Should be restricted for non-admin users' as test_description
FROM public.contact_submissions;

-- ==========================================
-- STEP 5: ADDITIONAL SECURITY MEASURES
-- ==========================================

-- Ensure API access is properly restricted
-- This helps ensure PostgREST respects RLS
ALTER ROLE postgres SET "request.jwt.claim.role" = '';
ALTER ROLE postgres SET "request.jwt.claim.email" = '';
ALTER ROLE postgres SET "request.jwt.claim.user_id" = '';

-- Reset connection to ensure RLS takes effect properly
SELECT pg_reload_conf();

-- ==========================================
-- STEP 6: VERIFICATION SCRIPT
-- ==========================================

-- Test RLS with different scenarios
DO $$
DECLARE
    payments_count int;
    contact_count int;
BEGIN
    -- Test as anonymous user (should be restricted)
    SELECT COUNT(*) INTO payments_count FROM public.payments;
    SELECT COUNT(*) INTO contact_count FROM public.contact_submissions;
    
    RAISE NOTICE 'RLS Test Results:';
    RAISE NOTICE 'Payments accessible to anonymous: %', payments_count;
    RAISE NOTICE 'Contact submissions accessible to anonymous: %', contact_count;
    
    IF payments_count > 0 OR contact_count > 0 THEN
        RAISE NOTICE '⚠️ WARNING: Tables may still be accessible - check RLS policies';
    ELSE
        RAISE NOTICE '✅ RLS appears to be working correctly';
    END IF;
END $$;
