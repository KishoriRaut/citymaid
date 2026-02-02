-- Simple RLS Setup for Contact Submissions (Fixed Version)
-- This provides secure row-level security without complex test functions

-- First, ensure the table exists
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES auth.users(id),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'email', 'phone', 'whatsapp', 'other')),
  visitor_id VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  referrer VARCHAR(500),
  admin_notes TEXT
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow anonymous insert" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated read" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated update" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated delete" ON contact_submissions;
DROP POLICY IF EXISTS "Allow service role all" ON contact_submissions;

-- POLICY 1: Allow anonymous users (public) to insert submissions
-- This enables the contact form to work without authentication
CREATE POLICY "Allow anonymous insert" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- POLICY 2: Allow authenticated users to read all submissions
-- This enables admin users to view all contact submissions
CREATE POLICY "Allow authenticated read" ON contact_submissions
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- POLICY 3: Allow authenticated users to update submissions
-- This enables admin users to update status and add notes
CREATE POLICY "Allow authenticated update" ON contact_submissions
  FOR UPDATE USING (
    auth.role() = 'authenticated'
  );

-- POLICY 4: Allow authenticated users to delete submissions
-- This enables admin users to delete submissions
CREATE POLICY "Allow authenticated delete" ON contact_submissions
  FOR DELETE USING (
    auth.role() = 'authenticated'
  );

-- POLICY 5: Allow service role (server-side) full access
-- This enables server-side functions and background jobs
CREATE POLICY "Allow service role all" ON contact_submissions
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON contact_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_visitor_id ON contact_submissions(visitor_id);

-- Create trigger for updated_at
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

-- Grant permissions
GRANT ALL ON contact_submissions TO authenticated;
GRANT ALL ON contact_submissions TO anon;
GRANT ALL ON contact_submissions TO service_role;

-- Create a secure view for admin dashboard
CREATE OR REPLACE VIEW contact_submissions_secure AS
SELECT 
  cs.id,
  cs.name,
  cs.email,
  cs.message,
  cs.status,
  cs.priority,
  cs.source,
  cs.created_at,
  cs.updated_at,
  cs.admin_notes,
  CASE 
    WHEN cs.created_at > NOW() - INTERVAL '24 hours' THEN 'new'
    WHEN cs.created_at > NOW() - INTERVAL '7 days' THEN 'recent'
    ELSE 'old'
  END as age_category,
  -- Mask email for privacy in logs
  LEFT(cs.email, POSITION('@' IN cs.email) - 1) || '@***' as masked_email
FROM contact_submissions cs;

-- Grant access to the secure view
GRANT SELECT ON contact_submissions_secure TO authenticated;
GRANT SELECT ON contact_submissions_secure TO service_role;

-- Simple verification queries
SELECT 
  'RLS Setup Complete' as status,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'contact_submissions') as policy_count,
  (SELECT rowsecurity FROM pg_tables WHERE tablename = 'contact_submissions') as rls_enabled;

-- Show all policies for verification
SELECT 
  schemaname || '.' || tablename as table_name,
  policyname as policy_name,
  permissive as is_enabled,
  cmd as policy_command,
  qual as policy_qual
FROM pg_policies 
WHERE tablename = 'contact_submissions'
ORDER BY policyname;

-- Test the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
ORDER BY ordinal_position;

-- Add comments for documentation
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions with RLS protection';
COMMENT ON COLUMN contact_submissions.status IS 'Submission status: pending, read, replied, closed';
COMMENT ON COLUMN contact_submissions.priority IS 'Priority level: low, normal, high, urgent';
COMMENT ON COLUMN contact_submissions.source IS 'Submission source: website, email, phone, whatsapp, other';
COMMENT ON COLUMN contact_submissions.visitor_id IS 'Visitor identifier for tracking anonymous users';
COMMENT ON VIEW contact_submissions_secure IS 'Secure view for admin dashboard with email masking';

-- Success message
SELECT 'Contact submissions RLS setup completed successfully!' as status;
