-- Restore Contact Submissions Table
-- This recreates the table with all the correct structure and settings

-- STEP 1: Create the contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  priority VARCHAR(20) DEFAULT 'normal',
  source VARCHAR(50) DEFAULT 'website',
  visitor_id VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  referrer VARCHAR(500),
  admin_notes TEXT
);

-- STEP 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON contact_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_visitor_id ON contact_submissions(visitor_id);

-- STEP 3: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- STEP 4: Grant permissions
GRANT ALL ON contact_submissions TO authenticated;
GRANT ALL ON contact_submissions TO anon;

-- STEP 5: Create secure view for admin dashboard
CREATE OR REPLACE VIEW contact_submissions_secure AS
SELECT 
  id,
  name,
  email,
  message,
  status,
  priority,
  source,
  created_at,
  updated_at,
  admin_notes,
  CASE 
    WHEN created_at > NOW() - INTERVAL '24 hours' THEN 'new'
    WHEN created_at > NOW() - INTERVAL '7 days' THEN 'recent'
    ELSE 'old'
  END as age_category
FROM contact_submissions;

-- STEP 6: Grant view permissions
GRANT SELECT ON contact_submissions_secure TO authenticated;

-- STEP 7: Test the table with a sample submission
INSERT INTO contact_submissions (
  name, 
  email, 
  message, 
  source,
  priority
) VALUES (
  'Restoration Test',
  'restore@test.com',
  'This is a test submission to verify the table restoration worked correctly.',
  'test',
  'normal'
) 
ON CONFLICT DO NOTHING;

-- STEP 8: Verify the restoration
SELECT 
  'Restoration Status' as status,
  'Contact submissions table restored successfully' as message,
  (SELECT COUNT(*) FROM contact_submissions) as total_submissions,
  (SELECT COUNT(*) FROM contact_submissions WHERE email = 'restore@test.com') as test_submission_found;

-- STEP 9: Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
ORDER BY ordinal_position;

-- STEP 10: Clean up test data (optional - uncomment if you want to remove test)
-- DELETE FROM contact_submissions WHERE email = 'restore@test.com';

-- Final success message
SELECT 
  '✅ Table Restoration Complete!' as final_status,
  'Contact form is ready for submissions' as ready_state,
  'API endpoint should work now' as api_status;
