-- Fix contact_unlock_requests table
-- Ensure ID column is properly set up with auto-increment

-- First, create a sequence for generating IDs if needed
CREATE SEQUENCE IF NOT EXISTS contact_unlock_requests_id_seq;

-- Update any null IDs with sequence values
UPDATE contact_unlock_requests 
SET id = nextval('contact_unlock_requests_id_seq')
WHERE id IS NULL;

-- Make the ID column use the sequence
ALTER TABLE contact_unlock_requests 
ALTER COLUMN id SET DEFAULT nextval('contact_unlock_requests_id_seq');

-- Make sure the column is NOT NULL
ALTER TABLE contact_unlock_requests 
ALTER COLUMN id SET NOT NULL;

-- Add primary key constraint if it doesn't exist
ALTER TABLE contact_unlock_requests 
ADD CONSTRAINT IF NOT EXISTS contact_unlock_requests_pkey 
PRIMARY KEY (id);
