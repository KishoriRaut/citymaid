-- RLS DIAGNOSTIC SCRIPT - Identify Why Tables Are Still Unrestricted
-- Run this script to diagnose RLS issues

-- ==========================================
-- STEP 1: CHECK CURRENT RLS STATUS
-- ==========================================

-- Check if RLS is actually enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('payments', 'contact_submissions')
ORDER BY tablename;

-- Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has SELECT condition'
        ELSE 'No SELECT condition'
    END as select_policy,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has INSERT condition'
        ELSE 'No INSERT condition'
    END as insert_policy
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('payments', 'contact_submissions')
ORDER BY tablename, policyname;

-- ==========================================
-- STEP 2: CHECK TABLE STRUCTURE
-- ==========================================

-- Check if user_id and visitor_id columns exist in payments
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'payments'
    AND column_name IN ('user_id', 'visitor_id', 'id')
ORDER BY column_name;

-- Check contact_submissions structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'contact_submissions'
ORDER BY column_name;

-- ==========================================
-- STEP 3: CHECK AUTHENTICATION STATUS
-- ==========================================

-- Check current user and authentication
SELECT 
    current_user as database_user,
    session_user as session_user,
    current_setting('request.jwt.claim.role', true) as jwt_role,
    current_setting('request.jwt.claim.email', true) as jwt_email,
    current_setting('request.jwt.claim.user_id', true) as jwt_user_id;

-- Check if profiles table exists and has admin users
SELECT 
    COUNT(*) as admin_count,
    string_agg(id, ', ') as admin_ids
FROM public.profiles 
WHERE role = 'admin';

-- ==========================================
-- STEP 4: TEST RLS FUNCTIONALITY
-- ==========================================

-- Test direct table access (should be restricted by RLS)
DO $$
DECLARE
    test_payments_count int;
    test_contact_count int;
    rls_enabled boolean;
BEGIN
    -- Check if RLS is enabled
    SELECT rowsecurity INTO rls_enabled 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'payments';
    
    RAISE NOTICE '=== RLS DIAGNOSTIC RESULTS ===';
    RAISE NOTICE 'RLS enabled on payments: %', rls_enabled;
    
    -- Test access to payments
    BEGIN
        SELECT COUNT(*) INTO test_payments_count FROM public.payments LIMIT 1;
        RAISE NOTICE 'Payments table accessible: % records', test_payments_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Payments table access error: %', SQLERRM;
    END;
    
    -- Test access to contact_submissions
    BEGIN
        SELECT COUNT(*) INTO test_contact_count FROM public.contact_submissions LIMIT 1;
        RAISE NOTICE 'Contact submissions table accessible: % records', test_contact_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Contact submissions table access error: %', SQLERRM;
    END;
    
    -- Diagnosis
    IF NOT rls_enabled THEN
        RAISE NOTICE '❌ ISSUE: RLS is not enabled on tables';
    ELSIF test_payments_count > 0 OR test_contact_count > 0 THEN
        RAISE NOTICE '❌ ISSUE: Tables are still accessible - RLS policies may be too permissive';
    ELSE
        RAISE NOTICE '✅ RLS appears to be working correctly';
    END IF;
    
    RAISE NOTICE '=== END DIAGNOSTIC ===';
END $$;

-- ==========================================
-- STEP 5: CHECK POSTGREST CONFIGURATION
-- ==========================================

-- Check PostgREST schema settings
SELECT 
    schemaname,
    tablename,
    tableowner,
    has_table_privilege(current_user, tablename, 'SELECT') as can_select,
    has_table_privilege(current_user, tablename, 'INSERT') as can_insert,
    has_table_privilege(current_user, tablename, 'UPDATE') as can_update,
    has_table_privilege(current_user, tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('payments', 'contact_submissions')
ORDER BY tablename;

-- ==========================================
-- STEP 6: RECOMMENDATIONS
-- ==========================================

-- This section provides specific recommendations based on findings
DO $$
DECLARE
    rls_enabled boolean;
    policy_count int;
BEGIN
    -- Check RLS status
    SELECT rowsecurity INTO rls_enabled 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'payments';
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('payments', 'contact_submissions');
    
    RAISE NOTICE '=== RECOMMENDATIONS ===';
    
    IF NOT rls_enabled THEN
        RAISE NOTICE '1. Enable RLS: ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;';
        RAISE NOTICE '2. Enable RLS: ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;';
    END IF;
    
    IF policy_count = 0 THEN
        RAISE NOTICE '3. Create RLS policies - no policies found';
    END IF;
    
    RAISE NOTICE '4. Run comprehensive-rls-fix.sql to resolve all issues';
    RAISE NOTICE '5. Test with different user roles to verify RLS is working';
    RAISE NOTICE '6. Check PostgREST configuration if issues persist';
    
    RAISE NOTICE '=== END RECOMMENDATIONS ===';
END $$;
