-- Migration: Complete details column setup
-- Purpose: Complete the details column setup if it was partially executed

-- Check current state of the details column
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'details';

-- Check if constraint exists
SELECT conname, contype, consrc
FROM pg_constraint 
WHERE conrelid = 'posts'::regclass AND conname = 'details_not_empty';

-- Update any existing NULL details
UPDATE posts 
SET details = CASE 
  WHEN post_type = 'employer' THEN 'Looking for a reliable worker for this position. Contact for more details.'
  WHEN post_type = 'employee' THEN 'Experienced professional seeking opportunities. Contact for more information.'
  ELSE 'Additional details available upon contact.'
END
WHERE details IS NULL OR details = '';

-- Make column NOT NULL if it's still nullable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'details' AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE posts ALTER COLUMN details SET NOT NULL;
    END IF;
END $$;

-- Add constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'details_not_empty' AND conrelid = 'posts'::regclass
    ) THEN
        ALTER TABLE posts 
        ADD CONSTRAINT details_not_empty 
        CHECK (length(details) >= 10);
    END IF;
END $$;

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
