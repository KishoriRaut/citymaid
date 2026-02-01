-- Simple Migration: Complete details column setup
-- Purpose: Complete the details column setup without complex constraint checking

-- Update any existing NULL details first
UPDATE posts 
SET details = CASE 
  WHEN post_type = 'employer' THEN 'Looking for a reliable worker for this position. Contact for more details.'
  WHEN post_type = 'employee' THEN 'Experienced professional seeking opportunities. Contact for more information.'
  ELSE 'Additional details available upon contact.'
END
WHERE details IS NULL OR details = '';

-- Make column NOT NULL (safe to run even if already NOT NULL)
ALTER TABLE posts ALTER COLUMN details SET NOT NULL;

-- Add constraint (safe to run even if constraint exists - will show error but continue)
ALTER TABLE posts 
ADD CONSTRAINT details_not_empty 
CHECK (length(details) >= 10);

-- Add comment to describe the column
COMMENT ON COLUMN posts.details IS 'Detailed description for job postings (employer) or personal profiles (employee). Minimum 10 characters, maximum 500 characters.';

-- Verify final state
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'details';

-- Show sample data to verify updates
SELECT 
    id, 
    post_type, 
    LEFT(details, 50) as details_preview,
    length(details) as details_length
FROM posts 
ORDER BY created_at DESC
LIMIT 5;
