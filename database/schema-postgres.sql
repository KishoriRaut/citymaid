-- Users table schema for Siscora app (PostgreSQL version)
-- This table stores user authentication information

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Example insert (password should be hashed in production)
-- INSERT INTO users (email, password) VALUES ('user@example.com', '$2b$10$hashedpasswordhere');

-- Example queries:
-- SELECT * FROM users WHERE email = 'user@example.com';
-- SELECT id, email, created_at FROM users;
-- UPDATE users SET password = 'newhashedpassword' WHERE id = 1;
-- DELETE FROM users WHERE id = 1;
