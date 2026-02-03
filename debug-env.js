// Debug script - run this in your terminal
// node debug-env.js

console.log('=== Environment Debug ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) {
  console.log('❌ No Supabase URL found');
} else {
  console.log('🔗 Supabase URL:', url);
  
  // Extract project ID
  const projectId = url.split('//')[1]?.split('.')[0];
  console.log('📦 Project ID:', projectId);
  
  // Environment detection logic
  let environment = 'Unknown';
  if (url.includes('dev') || projectId?.includes('dev')) {
    environment = 'Development';
  } else if (url.includes('prod') || projectId?.includes('prod')) {
    environment = 'Production';
  } else if (url.includes('localhost')) {
    environment = 'Local';
  } else {
    environment = 'Production'; // Default
  }
  
  console.log('🏷️  Detected Environment:', environment);
}

console.log('========================');
