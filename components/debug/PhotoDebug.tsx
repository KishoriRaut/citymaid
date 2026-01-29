"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";

interface PhotoDebugInfo {
  hasEnvironmentVars: boolean;
  bucketExists: boolean;
  samplePosts: any[];
  errors: string[];
}

export function PhotoDebug() {
  const [debugInfo, setDebugInfo] = useState<PhotoDebugInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPhotoSetup() {
      const info: PhotoDebugInfo = {
        hasEnvironmentVars: false,
        bucketExists: false,
        samplePosts: [],
        errors: []
      };

      try {
        // Check environment variables
        info.hasEnvironmentVars = !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL && 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        if (!info.hasEnvironmentVars) {
          info.errors.push("Missing Supabase environment variables");
        }

        if (supabaseClient) {
          // Check if bucket exists by trying to list files
          try {
            const { data: bucketFiles, error: bucketError } = await supabaseClient
              .storage
              .from("post-photos")
              .list("", { limit: 1 });

            if (bucketError) {
              info.errors.push(`Bucket error: ${bucketError.message}`);
            } else {
              info.bucketExists = true;
            }
          } catch (err) {
            info.errors.push(`Bucket check failed: ${err}`);
          }

          // Get sample posts to check photo_url
          const { data: posts, error: postsError } = await supabaseClient
            .rpc("get_public_posts")
            .limit(5);

          if (postsError) {
            info.errors.push(`Posts query error: ${postsError.message}`);
          } else {
            info.samplePosts = posts || [];
            const postsWithPhotos = posts?.filter(p => p.photo_url).length || 0;
            console.log(`Found ${postsWithPhotos} posts with photos out of ${posts?.length || 0}`);
          }
        }
      } catch (error) {
        info.errors.push(`Debug check failed: ${error}`);
      }

      setDebugInfo(info);
      setLoading(false);
    }

    checkPhotoSetup();
  }, []);

  if (loading) return <div>Loading photo debug info...</div>;

  if (!debugInfo) return <div>Failed to load debug info</div>;

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold text-lg mb-4">Photo Fetching Debug</h3>
      
      <div className="space-y-2">
        <div className={`p-2 rounded ${debugInfo.hasEnvironmentVars ? 'bg-green-100' : 'bg-red-100'}`}>
          <strong>Environment Variables:</strong> {debugInfo.hasEnvironmentVars ? '✅ Configured' : '❌ Missing'}
        </div>
        
        <div className={`p-2 rounded ${debugInfo.bucketExists ? 'bg-green-100' : 'bg-red-100'}`}>
          <strong>Storage Bucket:</strong> {debugInfo.bucketExists ? '✅ Accessible' : '❌ Not found/inaccessible'}
        </div>
        
        <div className="p-2 rounded bg-blue-100">
          <strong>Sample Posts:</strong> {debugInfo.samplePosts.length} found
          {debugInfo.samplePosts.map(post => (
            <div key={post.id} className="ml-4 text-sm">
              • {post.work} - Photo: {post.photo_url ? '✅' : '❌'}
              {post.photo_url && (
                <div className="ml-4">
                  <img src={post.photo_url} alt="test" className="w-16 h-16 object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {debugInfo.errors.length > 0 && (
          <div className="p-2 rounded bg-red-100">
            <strong>Errors:</strong>
            {debugInfo.errors.map((error, i) => (
              <div key={i} className="ml-4 text-sm text-red-700">• {error}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
