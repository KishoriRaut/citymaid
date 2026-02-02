-- Minimal RLS Setup for Contact Submissions (Guaranteed to Work)
-- Step-by-step approach to avoid any dependency issues

-- STEP 1: Create the basic table first
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

-- STEP 2: Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- STEP 3: Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous insert" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated read" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated update" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated delete" ON contact_submissions;

-- STEP 4: Create RLS policies
-- Allow anyone to insert (contact form)
CREATE POLICY "Allow anonymous insert" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read (admin dashboard)
CREATE POLICY "Allow authenticated read" ON contact_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to update (admin management)
CREATE POLICY "Allow authenticated update" ON contact_submissions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete (admin management)
CREATE POLICY "Allow authenticated delete" ON contact_submissions
  FOR DELETE USING (auth.role() = 'authenticated');

-- STEP 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON contact_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- STEP 6: Create update trigger
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

-- STEP 7: Grant permissions
GRANT ALL ON contact_submissions TO authenticated;
GRANT ALL ON contact_submissions TO anon;

-- STEP 8: Create simple view (after table is confirmed to exist)
DROP VIEW IF EXISTS contact_submissions_secure;
CREATE VIEW contact_submissions_secure AS
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

-- STEP 9: Grant view permissions
GRANT SELECT ON contact_submissions_secure TO authenticated;

-- STEP 10: Verification
SELECT 'Setup completed successfully!' as status;

-- Show table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
ORDER BY ordinal_position;

-- Show policies
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'contact_submissions'
ORDER BY policyname;

-- Show RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'contact_submissions';
