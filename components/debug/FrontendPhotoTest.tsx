"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";

export function FrontendPhotoTest() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    async function testFrontendData() {
      try {
        console.log("🔍 Frontend Test: Fetching posts for homepage...");
        
        if (!supabaseClient) {
          console.error("❌ Frontend Test: Supabase client not initialized");
          return;
        }
        
        // Test 1: Get posts the same way homepage does
        const { data: postsData, error: postsError } = await supabaseClient
          .from("posts")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(10);

        if (postsError) {
          console.error("❌ Frontend Test: Error fetching posts:", postsError);
          return;
        }

        console.log("📊 Frontend Test: Posts fetched:", postsData?.length || 0);
        console.log("📋 Frontend Test: Raw data:", postsData);

        if (postsData) {
          setPosts(postsData);
          
          // Test 2: Test each photo URL directly
          const results = await Promise.all(
            postsData.slice(0, 5).map(async (post: any, index: number) => {
              console.log(`🖼️ Frontend Test Post ${index + 1}:`, {
                id: post.id,
                work: post.work,
                post_type: post.post_type,
                status: post.status,
                photo_url: post.photo_url,
                has_photo: !!post.photo_url
              });

              if (post.photo_url) {
                try {
                  // Test URL accessibility
                  const response = await fetch(post.photo_url, { method: 'HEAD' });
                  return {
                    id: post.id,
                    work: post.work,
                    post_type: post.post_type,
                    photo_url: post.photo_url,
                    url_test: {
                      status: response.status,
                      ok: response.ok,
                      statusText: response.statusText
                    },
                    image_test: null
                  };
                } catch (error) {
                  return {
                    id: post.id,
                    work: post.work,
                    post_type: post.post_type,
                    photo_url: post.photo_url,
                    url_test: {
                      status: 'ERROR',
                      ok: false,
                      statusText: (error as Error).message
                    },
                    image_test: null
                  };
                }
              } else {
                return {
                  id: post.id,
                  work: post.work,
                  post_type: post.post_type,
                  photo_url: post.photo_url,
                  url_test: null,
                  image_test: 'NO_PHOTO'
                };
              }
            })
          );

          setTestResults(results);
        }
      } catch (error) {
        console.error("❌ Frontend Test: Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    }

    testFrontendData();
  }, []);

  if (loading) {
    return <div className="p-4 border rounded-lg bg-yellow-50">Loading frontend test data...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-blue-50 mb-4">
      <h3 className="font-bold text-lg mb-4">🔍 Frontend Photo Test</h3>
      
      <div className="space-y-4">
        <div className="text-sm">
          <strong>Total Posts Fetched:</strong> {posts.length}
        </div>
        
        <div className="text-sm">
          <strong>Posts with Photos:</strong> {posts.filter((p: any) => p.photo_url).length}
        </div>
        
        <div className="text-sm">
          <strong>Posts without Photos:</strong> {posts.filter((p: any) => !p.photo_url).length}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Post Details & URL Tests:</h4>
          {posts.map((post: any, index) => (
            <div key={post.id} className="p-2 bg-white rounded border text-xs">
              <div><strong>ID:</strong> {post.id}</div>
              <div><strong>Work:</strong> {post.work}</div>
              <div><strong>Type:</strong> {post.post_type}</div>
              <div><strong>Status:</strong> {post.status}</div>
              <div><strong>Photo URL:</strong> {post.photo_url || 'NULL'}</div>
              <div><strong>Has Photo:</strong> {post.photo_url ? '✅ YES' : '❌ NO'}</div>
              
              {testResults[index] && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <div><strong>URL Test:</strong> {testResults[index].url_test?.status || 'N/A'}</div>
                  <div><strong>URL OK:</strong> {testResults[index].url_test?.ok ? '✅' : '❌'}</div>
                  {testResults[index].url_test?.statusText && (
                    <div><strong>Status:</strong> {testResults[index].url_test.statusText}</div>
                  )}
                </div>
              )}
              
              {post.photo_url && (
                <div className="mt-2">
                  <img
                    src={post.photo_url}
                    alt={post.work}
                    className="w-20 h-20 object-cover border"
                    onLoad={() => console.log(`✅ Frontend Test: Image loaded for ${post.work}`)}
                    onError={() => console.log(`❌ Frontend Test: Image failed for ${post.work}`)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
