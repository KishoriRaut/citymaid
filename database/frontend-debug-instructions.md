-- ============================================================================
-- Frontend Test - Check if Data Reaches PostCard
-- ============================================================================
-- Add this to your homepage temporarily to debug data flow
-- ============================================================================

// Add this to your app/page.tsx after the loadPosts function:

// TEMPORARY DEBUG: Add this after line 48 (after setPosts)
console.log("🔍 DEBUGGING DATA FLOW:");
console.log("📊 Total posts loaded:", fetchedPosts.length);
console.log("📊 Employee posts:", fetchedPosts.filter(p => p.post_type === 'employee').length);
console.log("📊 Employer posts:", fetchedPosts.filter(p => p.post_type === 'employer').length);

// Check first 3 posts in detail
fetchedPosts.slice(0, 3).forEach((post, index) => {
  console.log(`📄 Post ${index + 1}:`, {
    id: post.id,
    post_type: post.post_type,
    work: post.work,
    photo_url: post.photo_url,
    hasPhoto: !!post.photo_url,
    photoUrlType: typeof post.photo_url,
    photoUrlLength: post.photo_url?.length || 0
  });
});

// Check specifically for employee posts with photos
const employeePostsWithPhotos = fetchedPosts.filter(p => p.post_type === 'employee' && p.photo_url);
console.log("👤 Employee posts with photos:", employeePostsWithPhotos.length);
employeePostsWithPhotos.slice(0, 3).forEach((post, index) => {
  console.log(`👤 Employee with Photo ${index + 1}:`, {
    id: post.id,
    work: post.work,
    photo_url: post.photo_url
  });
});

// TEMPORARY DEBUG: Add this to your PostCard.tsx at the beginning of the component:

// Add this right after line 16 (export function PostCard)
console.log("🔍 POSTCARD DEBUG: Component rendered with post:", {
  id: post.id,
  post_type: post.post_type,
  work: post.work,
  photo_url: post.photo_url,
  hasPhoto: !!post.photo_url,
  displayPhoto: post.photo_url
});
