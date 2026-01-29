-- Test storage bucket permissions and CORS settings
-- This will identify if storage access is blocked

-- 1. Check storage bucket policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 2. Check bucket configuration
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'post-photos';

-- 3. Test direct URL access pattern
-- This shows the exact URL format that should work
SELECT 
    'https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/' || name as direct_url,
    name,
    created_at
FROM storage.objects 
WHERE bucket_id = 'post-photos'
LIMIT 3;

-- 4. Check if there are any CORS restrictions
-- Note: CORS is typically configured at the Supabase project level, not in SQL
-- But we can check if there are any storage-specific restrictions
