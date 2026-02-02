-- Fix RLS Policies for Contact Submissions
-- This fixes the "new row violates row-level security policy" error

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow anonymous insert" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated read" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated update" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated delete" ON contact_submissions;

-- POLICY 1: Allow anyone to insert (this is the most important one for the contact form)
CREATE POLICY "Allow anonymous insert" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- POLICY 2: Allow authenticated users to read all submissions
CREATE POLICY "Allow authenticated read" ON contact_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- POLICY 3: Allow authenticated users to update submissions
CREATE POLICY "Allow authenticated update" ON contact_submissions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- POLICY 4: Allow authenticated users to delete submissions
CREATE POLICY "Allow authenticated delete" ON contact_submissions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Test the policies
SELECT 'RLS Policies Updated' as status;

-- Show the new policies
SELECT 
  policyname,
  cmd as operation,
  permissive as is_permissive,
  roles
FROM pg_policies 
WHERE tablename = 'contact_submissions'
ORDER BY policyname;

-- Test insert with anon role (simulate contact form submission)
-- This should work now
DO $$
BEGIN
    -- Set role to anon to test the policy
    SET LOCAL ROLE anon;
    
    -- Try to insert a test record
    INSERT INTO contact_submissions (
        name, 
        email, 
        message, 
        source, 
        priority
    ) VALUES (
        'RLS Test User',
        'rls-test@example.com',
        'This is a test to verify RLS policies work correctly.',
        'rls_test',
        'normal'
    );
    
    RAISE NOTICE '✅ RLS Test: Anonymous insert successful';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ RLS Test Failed: %', SQLERRM;
END $$;

-- Reset role
RESET ROLE;

-- Verify the test record was inserted
SELECT 
    'RLS Test Result' as test_name,
    COUNT(*) as test_records,
    COUNT(CASE WHEN email = 'rls-test@example.com' THEN 1 END) as rls_test_found
FROM contact_submissions 
WHERE email = 'rls-test@example.com';

-- Clean up test data
DELETE FROM contact_submissions WHERE email = 'rls-test@example.com';

-- Final verification
SELECT 
    'RLS Fix Complete' as status,
    'Contact form should now work without RLS violations' as message,
    'Anonymous users can insert submissions' as capability;
