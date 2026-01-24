// Network debugging utilities
export function setupNetworkDebugging() {
  if (typeof window === 'undefined') return;

  // Store original fetch
  const originalFetch = window.fetch;

  // Override fetch to add debugging
  window.fetch = async function(...args) {
    const [url, options = {}] = args;
    const startTime = Date.now();
    
    console.log(`🌐 NETWORK REQUEST: ${options.method || 'GET'} ${url}`);
    console.log('📤 Request headers:', options.headers);
    
    if (options.body) {
      try {
        const body = typeof options.body === 'string' 
          ? JSON.parse(options.body) 
          : options.body;
        console.log('📤 Request body:', body);
      } catch (e) {
        console.log('📤 Request body (raw):', options.body);
      }
    }

    try {
      const response = await originalFetch.apply(this, args);
      const endTime = Date.now();
      
      console.log(`✅ RESPONSE: ${response.status} ${response.statusText} (${endTime - startTime}ms)`);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      
      try {
        const responseText = await clonedResponse.text();
        console.log('📥 Response body:', responseText);
        
        // Try to parse as JSON for better formatting
        try {
          const jsonData = JSON.parse(responseText);
          console.log('📥 Response JSON:', jsonData);
        } catch (e) {
          // Not JSON, keep as text
        }
      } catch (e) {
        console.log('📥 Could not read response body:', (e as Error).message);
      }

      return response;
    } catch (error) {
      const endTime = Date.now();
      console.error(`❌ NETWORK ERROR: ${options.method || 'GET'} ${url} (${endTime - startTime}ms)`);
      console.error('❌ Error details:', error);
      throw error;
    }
  };

  console.log('🔍 Network debugging enabled - all fetch requests will be logged');
}

// Session debugging utility
export function debugSession() {
  if (typeof window === 'undefined') return;

  console.log('=== SESSION DEBUG ===');
  console.log('🍪 Cookies:', document.cookie);
  console.log('🔑 Session Storage:', Object.fromEntries(Object.entries(sessionStorage)));
  console.log('💾 Local Storage:', Object.fromEntries(Object.entries(localStorage)));
  console.log('📍 Current URL:', window.location.href);
  console.log('📱 User Agent:', navigator.userAgent);
  console.log('=== END SESSION DEBUG ===');
}
