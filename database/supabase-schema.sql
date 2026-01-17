-- Users table schema for Siscora app (Supabase/PostgreSQL)
-- This table stores user authentication information

-- Enable UUID extension (Supabase has this by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid()::text = id::text);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Note: Insert and delete policies should be created based on your app's requirements
-- For signup, you might want to allow public inserts, or handle it through a function

-- Example insert (password should be hashed in production)
-- INSERT INTO users (email, password) 
-- VALUES ('user@example.com', '$2b$10$hashedpasswordhere');

-- Example queries:
-- SELECT * FROM users WHERE email = 'user@example.com';
-- SELECT id, email, created_at FROM users;
-- UPDATE users SET password = 'newhashedpassword' WHERE id = 'uuid-here';
-- DELETE FROM users WHERE id = 'uuid-here';
