-- Test Contact Submissions Table
-- Run this in Supabase SQL Editor to verify everything is working

-- TEST 1: Check if table exists and has data
SELECT 
  'Table Status' as test_name,
  tablename as table_name,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'contact_submissions';

-- TEST 2: Show table structure
SELECT 
  'Table Structure' as test_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
ORDER BY ordinal_position;

-- TEST 3: Check RLS policies
SELECT 
  'RLS Policies' as test_name,
  policyname,
  cmd as operation,
  permissive as is_permissive
FROM pg_policies 
WHERE tablename = 'contact_submissions'
ORDER BY policyname;

-- TEST 4: Count existing submissions
SELECT 
  'Submission Count' as test_name,
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'read' THEN 1 END) as read_count,
  COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed
FROM contact_submissions;

-- TEST 5: Show recent submissions (if any)
SELECT 
  'Recent Submissions' as test_name,
  id,
  name,
  email,
  LEFT(message, 50) as message_preview,
  status,
  priority,
  source,
  created_at
FROM contact_submissions 
ORDER BY created_at DESC 
LIMIT 5;

-- TEST 6: Insert a test submission
INSERT INTO contact_submissions (
  name, 
  email, 
  message, 
  source,
  priority
) VALUES (
  'Test User',
  'test@example.com',
  'This is a test submission to verify the contact form is working correctly.',
  'test',
  'normal'
) 
ON CONFLICT DO NOTHING
RETURNING 
  'Test Insert' as test_name,
  id,
  name,
  email,
  created_at;

-- TEST 7: Verify the test submission was inserted
SELECT 
  'Verify Test Insert' as test_name,
  COUNT(*) as test_submissions,
  COUNT(CASE WHEN email = 'test@example.com' THEN 1 END) as test_email_found
FROM contact_submissions 
WHERE email = 'test@example.com';

-- TEST 8: Test permissions for anonymous users
SELECT 
  'Permission Test' as test_name,
  has_table_privilege('anon', 'contact_submissions', 'INSERT') as can_insert,
  has_table_privilege('anon', 'contact_submissions', 'SELECT') as can_select,
  has_table_privilege('anon', 'contact_submissions', 'UPDATE') as can_update,
  has_table_privilege('anon', 'contact_submissions', 'DELETE') as can_delete;

-- TEST 9: Test permissions for authenticated users
SELECT 
  'Auth Permission Test' as test_name,
  has_table_privilege('authenticated', 'contact_submissions', 'INSERT') as can_insert,
  has_table_privilege('authenticated', 'contact_submissions', 'SELECT') as can_select,
  has_table_privilege('authenticated', 'contact_submissions', 'UPDATE') as can_update,
  has_table_privilege('authenticated', 'contact_submissions', 'DELETE') as can_delete;

-- TEST 10: Show indexes
SELECT 
  'Indexes' as test_name,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'contact_submissions'
ORDER BY indexname;

-- TEST 11: Clean up test data (optional - uncomment if you want to remove test data)
-- DELETE FROM contact_submissions WHERE email = 'test@example.com';

-- TEST 12: Final summary
SELECT 
  'Summary' as test_name,
  'Contact submissions table setup complete!' as status,
  (SELECT COUNT(*) FROM contact_submissions) as total_submissions_now,
  'Ready for contact form submissions' as ready_status;

-- Success message
SELECT 
  '✅ All Tests Complete!' as test_name,
  'Contact form database is ready for use' as message,
  'You can now submit forms from the website' as next_step;
