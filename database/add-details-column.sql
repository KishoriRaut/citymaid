-- Migration: Add details column to posts table
-- Purpose: Add a new field for job details/personal details to improve post descriptions

-- Add details column to posts table (allow NULL initially)
ALTER TABLE posts 
ADD COLUMN details TEXT;

-- Update existing posts to have default details if they don't have any
UPDATE posts 
SET details = CASE 
  WHEN post_type = 'employer' THEN 'Looking for a reliable worker for this position. Contact for more details.'
  WHEN post_type = 'employee' THEN 'Experienced professional seeking opportunities. Contact for more information.'
  ELSE 'Additional details available upon contact.'
END
WHERE details IS NULL OR details = '';

-- Now add constraint to ensure details is not null and has minimum length
ALTER TABLE posts 
ALTER COLUMN details SET NOT NULL;

ALTER TABLE posts 
ADD CONSTRAINT details_not_empty 
CHECK (length(details) >= 10);

-- Add comment to describe the column
COMMENT ON COLUMN posts.details IS 'Detailed description for job postings (employer) or personal profiles (employee). Minimum 10 characters, maximum 500 characters.';

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'details';

-- Show sample data to verify updates
SELECT id, post_type, details, length(details) as details_length
FROM posts 
LIMIT 5;
