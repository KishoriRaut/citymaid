-- ============================================================================
-- Migration: Add sequential post_number to posts table
-- ============================================================================
-- This adds an auto-incrementing numeric ID (1, 2, 3...) for user-friendly display
-- while keeping UUID as the primary key for database integrity
-- ============================================================================

-- Add post_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'posts' 
    AND column_name = 'post_number'
  ) THEN
    -- Add the column
    ALTER TABLE public.posts ADD COLUMN post_number SERIAL;
    
    -- Create unique index to ensure no duplicates
    CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_post_number ON public.posts(post_number);
    
    -- Set post_number for existing posts based on creation order
    -- This ensures existing posts get sequential numbers
    WITH numbered_posts AS (
      SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) as row_num
      FROM public.posts
    )
    UPDATE public.posts p
    SET post_number = np.row_num
    FROM numbered_posts np
    WHERE p.id = np.id;
    
    -- Set the sequence to continue from the highest post_number
    -- This ensures new posts get the next number
    SELECT setval(
      pg_get_serial_sequence('public.posts', 'post_number'),
      COALESCE((SELECT MAX(post_number) FROM public.posts), 0),
      true
    );
  END IF;
END $$;

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'posts'
  AND column_name = 'post_number';

-- Show current post numbers
SELECT 
  id,
  post_number,
  work,
  status,
  created_at
FROM public.posts
ORDER BY post_number
LIMIT 10;
