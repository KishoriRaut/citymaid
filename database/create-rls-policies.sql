-- Create RLS Policies for payments and contact_submissions tables
-- This script ensures proper security after enabling RLS

-- ==========================================
-- PAYMENTS TABLE RLS POLICIES
-- ==========================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payment status" ON public.payments;

-- Create RLS policies for payments table
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (
        auth.uid()::text = user_id::text OR 
        auth.uid() IS NULL -- Allow visitors to see their payments
    );

CREATE POLICY "Users can insert their own payments" ON public.payments
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id::text OR 
        auth.uid() IS NULL -- Allow visitors to create payments
    );

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update payment status" ON public.payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ==========================================
-- CONTACT_SUBMISSIONS TABLE RLS POLICIES
-- ==========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view all contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;

-- Create RLS policies for contact_submissions table
CREATE POLICY "Anyone can submit contact forms" ON public.contact_submissions
    FOR INSERT WITH CHECK (true); -- Anyone can submit contact forms

CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- ==========================================
-- VERIFICATION QUERIES
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
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('payments', 'contact_submissions')
ORDER BY tablename, policyname;

-- Test RLS functionality (run as different users if needed)
-- This should show different results based on user role
SELECT COUNT(*) as payment_count FROM public.payments;
SELECT COUNT(*) as contact_count FROM public.contact_submissions;
