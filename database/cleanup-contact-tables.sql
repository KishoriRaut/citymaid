-- Safe Table Deletion Script
-- Run this to identify and delete the wrong contact table

-- STEP 1: Show all contact tables
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename LIKE '%contact%' 
   OR tablename LIKE '%submission%'
ORDER BY tablename;

-- STEP 2: Choose which table to delete
-- Based on the results above, run ONE of these commands:

-- If you see 'contact_submission' (singular), delete it:
-- DROP TABLE IF EXISTS contact_submission CASCADE;

-- If you see 'submissions' (generic), delete it:
-- DROP TABLE IF EXISTS submissions CASCADE;

-- If you see 'contact_form' (different), delete it:
-- DROP TABLE IF EXISTS contact_form CASCADE;

-- STEP 3: Verify deletion worked
-- Run this after deleting to confirm only the correct table remains:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE '%contact%' 
   OR tablename LIKE '%submission%';

-- STEP 4: Test the remaining table
INSERT INTO contact_submissions (name, email, message) 
VALUES ('Delete Test', 'test@delete.com', 'Testing after cleanup')
ON CONFLICT DO NOTHING;

SELECT 'Test successful - correct table working' as status;

-- Clean up test data
DELETE FROM contact_submissions WHERE email = 'test@delete.com';

-- Final check
SELECT 'Cleanup complete - contact form ready' as final_status;
