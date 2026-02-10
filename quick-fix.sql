-- Quick fix for contact_unlock_requests table
-- Create a proper sequence and update the table

-- Create a sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS contact_unlock_requests_id_seq START 1;

-- Update existing null IDs
UPDATE contact_unlock_requests 
SET id = nextval('contact_unlock_requests_id_seq')
WHERE id IS NULL;

-- Set the default for new records
ALTER TABLE contact_unlock_requests 
ALTER COLUMN id SET DEFAULT nextval('contact_unlock_requests_id_seq');

-- Make sure ID is not nullable
ALTER TABLE contact_unlock_requests 
ALTER COLUMN id SET NOT NULL;
