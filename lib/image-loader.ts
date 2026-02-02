// Enhanced image loading utility with better error handling
export class ImageLoader {
  private static cache = new Map<string, Promise<string>>();

  static async loadImage(url: string): Promise<string> {
    // Return cached promise if already loading
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Create loading promise
    const loadPromise = this.loadImageInternal(url);
    this.cache.set(url, loadPromise);

    return loadPromise;
  }

  private static async loadImageInternal(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`🖼️ ImageLoader: Loading ${url}`);

      // Test URL accessibility first
      fetch(url, { method: 'HEAD' })
        .then(response => {
          console.log(`📡 ImageLoader HEAD response:`, response.status, response.statusText);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Now try to load the image
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          img.onload = () => {
            console.log(`✅ ImageLoader: Successfully loaded ${url}`);
            resolve(url);
          };
          
          img.onerror = (error) => {
            console.error(`❌ ImageLoader: Failed to load ${url}`, error);
            reject(new Error(`Image load failed: ${url}`));
          };
          
          img.src = url;
        })
        .catch(error => {
          console.error(`❌ ImageLoader: HEAD request failed for ${url}`, error);
          reject(error);
        });
    });
  }

  static clearCache(): void {
    this.cache.clear();
  }
}
