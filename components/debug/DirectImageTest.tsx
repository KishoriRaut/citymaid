"use client";

import { useState } from "react";

export function DirectImageTest() {
  const [testUrl, setTestUrl] = useState("https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/1769339532559-lh4auf.jpeg");
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testImage = async () => {
    setIsLoading(true);
    setTestResult("");
    
    try {
      console.log("🔗 Testing direct image URL:", testUrl);
      
      // Method 1: HEAD request
      const headResponse = await fetch(testUrl, { method: 'HEAD' });
      console.log("📡 HEAD Response:", {
        status: headResponse.status,
        statusText: headResponse.statusText,
        contentType: headResponse.headers.get('content-type'),
        contentLength: headResponse.headers.get('content-length'),
        cacheControl: headResponse.headers.get('cache-control')
      });

      // Method 2: GET request as blob
      const getResponse = await fetch(testUrl);
      const blob = await getResponse.blob();
      console.log("📡 GET Response:", {
        status: getResponse.status,
        statusText: getResponse.statusText,
        ok: getResponse.ok,
        blobSize: blob.size,
        blobType: blob.type
      });

      // Method 3: Create object URL and test in browser
      const objectUrl = URL.createObjectURL(blob);
      console.log("🔗 Object URL created:", objectUrl);

      setTestResult(`
        HEAD: ${headResponse.status} ${headResponse.statusText}
        GET: ${getResponse.status} ${getResponse.statusText}
        Content-Type: ${getResponse.headers.get('content-type')}
        Size: ${blob.size} bytes
        Object URL: ${objectUrl}
      `);

      // Test display
      const img = new Image();
      img.onload = () => {
        console.log("✅ Image loaded via Object URL");
        setTestResult(prev => prev + "\n✅ Image display test: SUCCESS");
      };
      img.onerror = (e) => {
        console.error("❌ Image failed to display:", e);
        setTestResult(prev => prev + "\n❌ Image display test: FAILED");
      };
      img.src = objectUrl;

    } catch (error) {
      console.error("❌ Direct image test failed:", error);
      setTestResult(`ERROR: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 mb-4">
      <h3 className="font-bold text-lg mb-4">🔗 Direct Image URL Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test URL:</label>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter image URL to test"
          />
        </div>
        
        <button
          onClick={testImage}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Testing..." : "Test Image"}
        </button>
        
        {testResult && (
          <div className="p-3 bg-gray-100 rounded">
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
        
        {/* Test image display */}
        {testUrl && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Direct Image Test:</h4>
            <img
              src={testUrl}
              alt="Direct test"
              className="max-w-xs h-auto border rounded"
              onLoad={() => console.log("✅ Direct img loaded")}
              onError={(e) => console.error("❌ Direct img failed:", e)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
