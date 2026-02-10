const fs = require('fs').promises;
const path = require('path');

// Files to remove
const filesToRemove = [
  'app/payment/[requestId]/simple-page.tsx',
  'app/payment/[requestId]/test-page.tsx',
  'app/payment/view/page.tsx',
];

// Function to safely remove a file
async function removeFile(filePath) {
  try {
    await fs.unlink(path.join(__dirname, '..', filePath));
    console.log(`✅ Removed: ${filePath}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`ℹ️ Not found: ${filePath}`);
    } else {
      console.error(`❌ Error removing ${filePath}:`, error.message);
    }
  }
}

// Main cleanup function
async function cleanup() {
  console.log('🚀 Starting cleanup...');
  
  // Remove files
  for (const file of filesToRemove) {
    await removeFile(file);
  }

  console.log('\n✨ Cleanup complete!');
}

// Run the cleanup
cleanup().catch(console.error);
