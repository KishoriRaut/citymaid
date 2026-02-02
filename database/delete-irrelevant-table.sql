-- Identify and Delete Irrelevant Contact Tables
-- This will help you identify which table to delete and provide safe deletion commands

-- STEP 1: Show all contact-related tables
SELECT 
    'All Contact Tables' as step,
    tablename,
    rowsecurity as rls_enabled,
    'Review this table' as action
FROM pg_tables 
WHERE tablename LIKE '%contact%' 
   OR tablename LIKE '%submission%'
ORDER BY tablename;

-- STEP 2: Show table details to help identify the correct one
SELECT 
    'Table Details' as step,
    table_name,
    column_name,
    data_type,
    ordinal_position
FROM information_schema.columns 
WHERE table_name LIKE '%contact%' 
   OR table_name LIKE '%submission%'
ORDER BY table_name, ordinal_position;

-- STEP 3: Check which table has data (if any)
SELECT 
    'Data Check' as step,
    table_name,
    COALESCE(
        (SELECT COUNT(*)::text 
         FROM information_schema.tables t
         WHERE t.table_name = c.table_name
         AND EXISTS (
             SELECT 1 FROM information_schema.columns 
             WHERE table_name = t.table_name 
             LIMIT 1
         )
        ), 'Unknown'
    ) as has_data
FROM information_schema.columns c
WHERE table_name LIKE '%contact%' 
   OR table_name LIKE '%submission%'
GROUP BY table_name
ORDER BY table_name;

-- STEP 4: Deletion commands (commented out for safety)
-- Choose ONE of these commands based on which table you want to delete

-- OPTION A: Delete 'contact_submission' (singular) - if it exists
-- DROP TABLE IF EXISTS contact_submission CASCADE;

-- OPTION B: Delete 'contact_submissions' (plural) - if you want to delete our current table
-- DROP TABLE IF EXISTS contact_submissions CASCADE;

-- OPTION C: Delete any other variant table
-- DROP TABLE IF EXISTS submissions CASCADE;
-- DROP TABLE IF EXISTS contact_form CASCADE;

-- STEP 5: After deletion, verify only the correct table remains
-- Run this after deleting to confirm:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename LIKE '%contact%' OR tablename LIKE '%submission%';

-- STEP 6: Test the remaining table works
-- INSERT INTO contact_submissions (name, email, message) 
-- VALUES ('Test After Delete', 'test@delete.com', 'Testing after table cleanup')
-- ON CONFLICT DO NOTHING;

-- SELECT 'Test successful - correct table is working' as status;

-- Clean up test data
-- DELETE FROM contact_submissions WHERE email = 'test@delete.com';

-- Final verification
SELECT 
    'Final Status' as step,
    'Run the appropriate DROP TABLE command above' as instruction,
    'Then run this verification script' as next_step;
