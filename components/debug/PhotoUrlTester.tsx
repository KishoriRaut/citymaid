"use client";

import { useEffect } from "react";

export function PhotoUrlTester({ photoUrl }: { photoUrl: string | null }) {
  useEffect(() => {
    if (photoUrl) {
      console.log(`🔗 Testing photo URL:`, photoUrl);
      
      // Test if URL is accessible
      fetch(photoUrl, { method: 'HEAD' })
        .then(response => {
          console.log(`✅ Photo URL response:`, response.status, response.statusText);
          if (response.ok) {
            console.log(`✅ Photo is accessible`);
          } else {
            console.log(`❌ Photo not accessible:`, response.status);
          }
        })
        .catch(error => {
          console.log(`❌ Photo URL error:`, error);
        });
    }
  }, [photoUrl]);

  return null; // This component is for debugging only
}
