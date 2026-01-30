-- Add user contact information to contact_unlock_requests table
-- Run this in Supabase SQL Editor

-- Add new columns for user contact information
ALTER TABLE contact_unlock_requests 
ADD COLUMN user_name VARCHAR(100),
ADD COLUMN user_phone VARCHAR(20),
ADD COLUMN user_email VARCHAR(255),
ADD COLUMN contact_preference VARCHAR(10) DEFAULT 'both',
ADD COLUMN delivery_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN delivery_notes TEXT;

-- Add constraints for contact preference
ALTER TABLE contact_unlock_requests 
ADD CONSTRAINT check_contact_preference 
CHECK (contact_preference IN ('sms', 'email', 'both'));

-- Add constraints for delivery status
ALTER TABLE contact_unlock_requests 
ADD CONSTRAINT check_delivery_status 
CHECK (delivery_status IN ('pending', 'sent', 'failed', 'manual'));

-- Add index for better query performance
CREATE INDEX idx_contact_unlock_requests_delivery_status 
ON contact_unlock_requests(delivery_status);

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contact_unlock_requests' 
  AND column_name IN ('user_name', 'user_phone', 'user_email', 'contact_preference', 'delivery_status', 'delivery_notes')
ORDER BY column_name;
