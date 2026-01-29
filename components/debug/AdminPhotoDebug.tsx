"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";

export function AdminPhotoDebug() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        console.log("🔍 Admin Debug: Fetching posts...");
        
        if (!supabaseClient) {
          console.error("❌ Admin Debug: Supabase client not initialized");
          return;
        }
        
        const { data, error } = await supabaseClient
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          console.error("❌ Admin Debug: Error fetching posts:", error);
          return;
        }

        console.log("📊 Admin Debug: Posts fetched:", data?.length || 0);
        console.log("📋 Admin Debug: Raw data:", data);

        if (data) {
          setPosts(data);
          
          // Log photo details for each post
          data.forEach((post: any, index: number) => {
            console.log(`🖼️ Admin Debug Post ${index + 1}:`, {
              id: post.id,
              work: post.work,
              post_type: post.post_type,
              status: post.status,
              photo_url: post.photo_url,
              has_photo: !!post.photo_url
            });
          });
        }
      } catch (error) {
        console.error("❌ Admin Debug: Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="p-4 border rounded-lg bg-yellow-50">Loading admin debug data...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-red-50 mb-4">
      <h3 className="font-bold text-lg mb-4">🔍 Admin Photo Debug Panel</h3>
      
      <div className="space-y-4">
        <div className="text-sm">
          <strong>Total Posts:</strong> {posts.length}
        </div>
        
        <div className="text-sm">
          <strong>Posts with Photos:</strong> {posts.filter((p: any) => p.photo_url).length}
        </div>
        
        <div className="text-sm">
          <strong>Posts without Photos:</strong> {posts.filter((p: any) => !p.photo_url).length}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Post Details:</h4>
          {posts.map((post: any) => (
            <div key={post.id} className="p-2 bg-white rounded border text-xs">
              <div><strong>ID:</strong> {post.id}</div>
              <div><strong>Work:</strong> {post.work}</div>
              <div><strong>Type:</strong> {post.post_type}</div>
              <div><strong>Status:</strong> {post.status}</div>
              <div><strong>Photo URL:</strong> {post.photo_url || 'NULL'}</div>
              <div><strong>Has Photo:</strong> {post.photo_url ? '✅ YES' : '❌ NO'}</div>
              
              {post.photo_url && (
                <div className="mt-2">
                  <img
                    src={post.photo_url}
                    alt={post.work}
                    className="w-20 h-20 object-cover border"
                    onLoad={() => console.log(`✅ Admin Debug: Image loaded for ${post.work}`)}
                    onError={() => console.log(`❌ Admin Debug: Image failed for ${post.work}`)}
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
