-- Contact Form Submissions Table for Supabase
-- This table will store all contact form submissions from the website

-- Create the contact_submissions table
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
  admin_notes TEXT,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'email', 'phone', 'whatsapp', 'other')),
  visitor_id VARCHAR(255), -- For tracking anonymous users
  user_agent TEXT, -- Browser information
  ip_address INET, -- User IP address
  referrer VARCHAR(500) -- Where they came from
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON contact_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_visitor_id ON contact_submissions(visitor_id);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- 1. Allow anonymous users to insert submissions (contact form)
CREATE POLICY "Allow anonymous insert" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- 2. Allow authenticated users (admin) to read all submissions
CREATE POLICY "Allow authenticated read" ON contact_submissions
  FOR SELECT USING (
    auth.role() = 'authenticated' 
    AND auth.jwt() ->> 'role' = 'admin'
  );

-- 3. Allow authenticated users (admin) to update submissions
CREATE POLICY "Allow authenticated update" ON contact_submissions
  FOR UPDATE USING (
    auth.role() = 'authenticated' 
    AND auth.jwt() ->> 'role' = 'admin'
  );

-- 4. Allow authenticated users (admin) to delete submissions
CREATE POLICY "Allow authenticated delete" ON contact_submissions
  FOR DELETE USING (
    auth.role() = 'authenticated' 
    AND auth.jwt() ->> 'role' = 'admin'
  );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to get contact submissions with pagination
CREATE OR REPLACE FUNCTION get_contact_submissions(
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 20,
  p_status VARCHAR DEFAULT NULL,
  p_priority VARCHAR DEFAULT NULL,
  p_search VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  email VARCHAR(255),
  message TEXT,
  status VARCHAR(50),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  replied_by UUID,
  admin_notes TEXT,
  priority VARCHAR(20),
  source VARCHAR(50),
  visitor_id VARCHAR(255),
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.name,
    cs.email,
    cs.message,
    cs.status,
    cs.created_at,
    cs.updated_at,
    cs.replied_at,
    cs.replied_by,
    cs.admin_notes,
    cs.priority,
    cs.source,
    cs.visitor_id,
    COUNT(*) OVER() as total_count
  FROM contact_submissions cs
  WHERE 
    -- Filter by status if provided
    (p_status IS NULL OR cs.status = p_status)
    -- Filter by priority if provided
    AND (p_priority IS NULL OR cs.priority = p_priority)
    -- Search in name, email, or message if search term provided
    AND (
      p_search IS NULL 
      OR LOWER(cs.name) LIKE LOWER('%' || p_search || '%')
      OR LOWER(cs.email) LIKE LOWER('%' || p_search || '%')
      OR LOWER(cs.message) LIKE LOWER('%' || p_search || '%')
    )
  ORDER BY cs.created_at DESC
  LIMIT p_limit OFFSET ((p_page - 1) * p_limit);
END;
$$;

-- Create a function to insert contact submission
CREATE OR REPLACE FUNCTION insert_contact_submission(
  p_name VARCHAR(255),
  p_email VARCHAR(255),
  p_message TEXT,
  p_source VARCHAR DEFAULT 'website',
  p_visitor_id VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_referrer VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  email VARCHAR(255),
  message TEXT,
  status VARCHAR(50),
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_priority VARCHAR(20) := 'normal';
BEGIN
  -- Determine priority based on message content
  IF LOWER(p_message) LIKE '%urgent%' OR LOWER(p_message) LIKE '%emergency%' THEN
    v_priority := 'urgent';
  ELSIF LOWER(p_message) LIKE '%complaint%' OR LOWER(p_message) LIKE '%problem%' THEN
    v_priority := 'high';
  ELSIF LOWER(p_message) LIKE '%question%' OR LOWER(p_message) LIKE '%inquiry%' THEN
    v_priority := 'normal';
  ELSE
    v_priority := 'normal';
  END IF;

  INSERT INTO contact_submissions (
    name, email, message, source, visitor_id, user_agent, ip_address, referrer, priority
  ) VALUES (
    p_name, p_email, p_message, p_source, p_visitor_id, p_user_agent, p_ip_address, p_referrer, v_priority
  )
  RETURNING 
    id, name, email, message, status, created_at;
END;
$$;

-- Create a function to update submission status
CREATE OR REPLACE FUNCTION update_contact_status(
  p_id UUID,
  p_status VARCHAR,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  status VARCHAR,
  updated_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE contact_submissions 
  SET 
    status = p_status,
    admin_notes = p_admin_notes,
    replied_at = CASE WHEN p_status = 'replied' THEN NOW() ELSE replied_at END
  WHERE id = p_id
  RETURNING id, status, updated_at, replied_at;
END;
$$;

-- Create a view for admin dashboard
CREATE OR REPLACE VIEW contact_submissions_admin AS
SELECT 
  id,
  name,
  email,
  LEFT(message, 100) as message_preview, -- First 100 characters
  message,
  status,
  priority,
  source,
  created_at,
  updated_at,
  replied_at,
  admin_notes,
  visitor_id,
  CASE 
    WHEN created_at > NOW() - INTERVAL '24 hours' THEN 'new'
    WHEN created_at > NOW() - INTERVAL '7 days' THEN 'recent'
    ELSE 'old'
  END as age_category
FROM contact_submissions
ORDER BY created_at DESC;

-- Grant necessary permissions
GRANT ALL ON contact_submissions TO authenticated;
GRANT ALL ON contact_submissions TO anon;
GRANT EXECUTE ON FUNCTION get_contact_submissions TO authenticated;
GRANT EXECUTE ON FUNCTION insert_contact_submission TO anon;
GRANT EXECUTE ON FUNCTION update_contact_status TO authenticated;
GRANT SELECT ON contact_submissions_admin TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from the website';
COMMENT ON COLUMN contact_submissions.status IS 'pending, read, replied, closed';
COMMENT ON COLUMN contact_submissions.priority IS 'low, normal, high, urgent';
COMMENT ON COLUMN contact_submissions.source IS 'website, email, phone, whatsapp, other';
COMMENT ON COLUMN contact_submissions.visitor_id IS 'For tracking anonymous users across sessions';
