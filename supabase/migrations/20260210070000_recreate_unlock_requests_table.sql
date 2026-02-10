-- Fix the contact_unlock_requests table ID column
-- Drop and recreate the table with proper ID setup

-- First backup existing data
CREATE TABLE contact_unlock_requests_backup AS 
SELECT * FROM contact_unlock_requests;

-- Drop the existing table
DROP TABLE IF EXISTS contact_unlock_requests;

-- Recreate with proper ID column
CREATE TABLE contact_unlock_requests (
    id BIGSERIAL PRIMARY KEY,
    post_id TEXT NOT NULL,
    visitor_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    user_name TEXT,
    user_phone TEXT,
    user_email TEXT,
    contact_preference TEXT,
    payment_proof TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restore data with new IDs
INSERT INTO contact_unlock_requests (post_id, visitor_id, status, user_name, user_phone, user_email, contact_preference, payment_proof, created_at)
SELECT post_id, visitor_id, status, user_name, user_phone, user_email, contact_preference, payment_proof, created_at
FROM contact_unlock_requests_backup;

-- Drop backup table
DROP TABLE contact_unlock_requests_backup;

-- Add indexes for performance
CREATE INDEX idx_contact_unlock_requests_post_id ON contact_unlock_requests(post_id);
CREATE INDEX idx_contact_unlock_requests_status ON contact_unlock_requests(status);
CREATE INDEX idx_contact_unlock_requests_visitor_id ON contact_unlock_requests(visitor_id);
