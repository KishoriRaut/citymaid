-- Migration: Add details column to posts table
-- Purpose: Add a new field for job details/personal details to improve post descriptions

-- Add details column to posts table
ALTER TABLE posts 
ADD COLUMN details TEXT;

-- Add constraint to ensure details is not null and has minimum length
ALTER TABLE posts 
ADD CONSTRAINT details_not_empty 
CHECK (length(COALESCE(details, '')) >= 10);

-- Add comment to describe the column
COMMENT ON COLUMN posts.details IS 'Detailed description for job postings (employer) or personal profiles (employee). Minimum 10 characters, maximum 500 characters.';

-- Update existing posts to have default details if they don't have any
UPDATE posts 
SET details = CASE 
  WHEN post_type = 'employer' THEN 'Looking for a reliable worker for this position. Contact for more details.'
  WHEN post_type = 'employee' THEN 'Experienced professional seeking opportunities. Contact for more information.'
  ELSE 'Additional details available upon contact.'
END
WHERE details IS NULL OR details = '';

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'details';
