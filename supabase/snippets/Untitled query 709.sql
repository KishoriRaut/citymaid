-- Disable RLS on all tables for local development
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_unlock_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant permissions to public roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Test query to verify posts are accessible
SELECT * FROM posts 
WHERE status = 'approved' AND post_type = 'employee' 
ORDER BY created_at DESC 
LIMIT 12;