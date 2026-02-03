// Environment information utility
export const getEnvironmentInfo = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    return { environment: 'Unknown', url: 'Not configured' };
  }
  
  // Extract project ID from URL to identify environment
  const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
  
  // Determine environment based on URL or project ID
  let environment = 'Unknown';
  if (supabaseUrl.includes('dev') || supabaseUrl.includes('development')) {
    environment = 'Development';
  } else if (supabaseUrl.includes('prod') || supabaseUrl.includes('production')) {
    environment = 'Production';
  } else if (supabaseUrl.includes('localhost')) {
    environment = 'Local';
  } else {
    // Default to development for safety (unless explicitly prod)
    environment = 'Development';
  }
  
  return {
    environment,
    url: supabaseUrl,
    projectId: projectId || 'Unknown'
  };
};

// For development debugging
export const logEnvironmentInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    const env = getEnvironmentInfo();
    console.log('🔧 Environment Info:', {
      environment: env.environment,
      projectId: env.projectId,
      nodeEnv: process.env.NODE_ENV
    });
  }
};
