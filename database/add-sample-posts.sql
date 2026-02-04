-- Add sample posts for testing
-- Run this in your production Supabase SQL Editor

-- Insert sample employer posts
INSERT INTO public.posts (post_type, work, time, place, salary, contact, status) VALUES
('employer', 'Looking for experienced maid for full-time housekeeping', 'Full-time', 'Kathmandu', 'Rs 15,000/month', '9841234567', 'approved'),
('employer', 'Need part-time cleaner for 3 hours daily', 'Part-time', 'Patan', 'Rs 8,000/month', '9849876543', 'approved'),
('employer', 'Live-in maid required for family with 2 children', 'Full-time', 'Bhaktapur', 'Rs 18,000/month', '9845556666', 'approved');

-- Insert sample employee posts  
INSERT INTO public.posts (post_type, work, time, place, salary, contact, status) VALUES
('employee', 'Experienced maid available for full-time work', 'Full-time', 'Kathmandu', 'Negotiable', '9841112222', 'approved'),
('employee', 'Part-time cleaner available evenings and weekends', 'Part-time', 'Lalitpur', 'Rs 500/day', '9843334444', 'approved'),
('employee', 'Live-in maid seeking position with family', 'Full-time', 'Kathmandu', 'Rs 16,000/month', '9847778888', 'approved');

-- Verify posts were added
SELECT post_type, work, status, created_at FROM public.posts ORDER BY created_at DESC LIMIT 10;
