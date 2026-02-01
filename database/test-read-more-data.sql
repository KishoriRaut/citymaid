-- Test Data: Create longer details to test Read more functionality
-- Purpose: Update some posts with details longer than 120 characters to test the Read more link

-- Update a few employer posts with longer details
UPDATE posts 
SET details = 'Looking for an experienced software developer to join our growing team. Must have strong skills in React, Node.js, and modern web technologies. We offer competitive salary, great benefits, and flexible work environment. This is a full-time position with opportunities for growth and advancement.'
WHERE post_type = 'employer' AND id IN (
  SELECT id FROM posts WHERE post_type = 'employer' LIMIT 3
);

-- Update a few employee posts with longer details  
UPDATE posts 
SET details = 'Experienced web designer with 5+ years of expertise in responsive design, UI/UX, and modern web technologies. Proficient in Figma, Adobe Creative Suite, and frontend development. Looking for challenging opportunities to create beautiful, functional websites that delight users.'
WHERE post_type = 'employee' AND id IN (
  SELECT id FROM posts WHERE post_type = 'employee' LIMIT 3
);

-- Show the updated posts with character counts
SELECT 
    id, 
    post_type, 
    LEFT(details, 50) as details_preview,
    length(details) as details_length,
    CASE 
        WHEN length(details) > 120 THEN '✅ Will show Read more'
        ELSE '❌ No Read more needed'
    END as read_more_status
FROM posts 
WHERE length(details) > 120
ORDER BY created_at DESC
LIMIT 10;
