"use client";

import { useEffect, useState } from "react";

interface PhotoDebuggerProps {
  posts: any[];
}

export function PhotoDebugger({ posts }: PhotoDebuggerProps) {
  const [testResults, setTestResults] = useState<{[key: string]: string}>({});

  useEffect(() => {
    console.log("🔍 PhotoDebugger: Starting deep analysis");
    console.log("🔍 PhotoDebugger: Total posts received:", posts.length);
    
    // Analyze each post
    posts.forEach((post, index) => {
      console.log(`🔍 Post ${index + 1}:`, {
        id: post.id,
        work: post.work,
        post_type: post.post_type,
        photo_url: post.photo_url,
        hasPhoto: !!post.photo_url,
        photoUrlLength: post.photo_url?.length || 0
      });

      // Test photo URL accessibility
      if (post.photo_url) {
        testPhotoUrl(post.photo_url, post.id);
      }
    });

    // Count posts by type and photo status
    const employeePosts = posts.filter(p => p.post_type === 'employee');
    const employeeWithPhotos = employeePosts.filter(p => p.photo_url);
    const employeeWithoutPhotos = employeePosts.filter(p => !p.photo_url);
    
    console.log("📊 Analysis Summary:", {
      totalPosts: posts.length,
      employeePosts: employeePosts.length,
      employeeWithPhotos: employeeWithPhotos.length,
      employeeWithoutPhotos: employeeWithoutPhotos.length,
      employerPosts: posts.filter(p => p.post_type === 'employer').length
    });

  }, [posts]);

  const testPhotoUrl = async (url: string, postId: string) => {
    try {
      console.log(`🔗 Testing photo URL for post ${postId}:`, url);
      
      // Test with HEAD request first
      const headResponse = await fetch(url, { method: 'HEAD' });
      console.log(`📡 HEAD response for post ${postId}:`, {
        status: headResponse.status,
        statusText: headResponse.statusText,
        contentType: headResponse.headers.get('content-type'),
        contentLength: headResponse.headers.get('content-length')
      });

      // Test with GET request
      const getResponse = await fetch(url);
      console.log(`📡 GET response for post ${postId}:`, {
        status: getResponse.status,
        statusText: getResponse.statusText,
        ok: getResponse.ok
      });

      setTestResults(prev => ({
        ...prev,
        [postId]: getResponse.ok ? '✅ Accessible' : `❌ Error: ${getResponse.status}`
      }));

    } catch (error) {
      console.error(`❌ Photo URL test failed for post ${postId}:`, error);
      setTestResults(prev => ({
        ...prev,
        [postId]: `❌ Network Error: ${error}`
      }));
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-red-50 mb-4">
      <h3 className="font-bold text-lg mb-4">🔍 Photo Debugger</h3>
      
      <div className="space-y-2">
        <div className="font-semibold">Posts Analysis:</div>
        <div>Total Posts: {posts.length}</div>
        <div>Employee Posts: {posts.filter(p => p.post_type === 'employee').length}</div>
        <div>Employee with Photos: {posts.filter(p => p.post_type === 'employee' && p.photo_url).length}</div>
        
        <div className="font-semibold mt-4">Photo URL Tests:</div>
        {Object.entries(testResults).map(([postId, result]) => (
          <div key={postId} className="text-sm">
            Post {postId.slice(0, 8)}...: {result}
          </div>
        ))}
      </div>
    </div>
  );
}
