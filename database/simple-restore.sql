-- Simple Contact Table Restoration
-- Direct approach to recreate the table

-- First, check if table exists
SELECT 'Checking table status...' as status;

-- Drop any existing table to start fresh
DROP TABLE IF EXISTS contact_submissions CASCADE;

-- Create the table from scratch
CREATE TABLE contact_submissions (
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

-- Verify table was created
SELECT 'Table created successfully' as status,
       tablename as table_name
FROM pg_tables 
WHERE tablename = 'contact_submissions';

-- Show table structure
SELECT 'Table structure:' as info,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
ORDER BY ordinal_position;

-- Create basic indexes
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Grant permissions
GRANT ALL ON contact_submissions TO authenticated;
GRANT ALL ON contact_submissions TO anon;

-- Test insert
INSERT INTO contact_submissions (name, email, message) 
VALUES ('Test User', 'test@example.com', 'Test message after restoration');

-- Verify test insert worked
SELECT 'Test insert verification:' as info,
       COUNT(*) as total_submissions,
       COUNT(CASE WHEN email = 'test@example.com' THEN 1 END) as test_found
FROM contact_submissions;

-- Final status
SELECT '✅ Contact table restored and working!' as final_status;
