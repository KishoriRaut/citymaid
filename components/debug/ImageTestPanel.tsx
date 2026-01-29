"use client";

import { useState, useEffect } from "react";

export function ImageTestPanel() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testUrls = [
    "https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/1769339532559-lh4auf.jpeg",
    "https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/1769321056903-rqew3w.jpg",
    "https://jjnibbkhubafesjqjohm.supabase.co/storage/v1/object/public/post-photos/1769242601376-qgndmt.jpg"
  ];

  const testImage = async (url: string, index: number) => {
    const result = { url, index, status: 'testing', details: '' };
    
    try {
      console.log(`🔗 Testing image ${index + 1}:`, url);
      
      // Test 1: HEAD request
      const headResponse = await fetch(url, { method: 'HEAD' });
      result.details += `HEAD: ${headResponse.status} ${headResponse.statusText}\n`;
      
      if (!headResponse.ok) {
        result.status = 'failed';
        result.details += `HEAD request failed\n`;
        return result;
      }

      // Test 2: GET request as blob
      const getResponse = await fetch(url);
      const blob = await getResponse.blob();
      result.details += `GET: ${getResponse.status} ${getResponse.statusText}\n`;
      result.details += `Size: ${blob.size} bytes\n`;
      result.details += `Type: ${blob.type}\n`;

      if (!getResponse.ok) {
        result.status = 'failed';
        result.details += `GET request failed\n`;
        return result;
      }

      // Test 3: Create object URL and test image loading
      const objectUrl = URL.createObjectURL(blob);
      
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
          console.log(`✅ Image ${index + 1} loaded successfully`);
          result.status = 'success';
          result.details += `Image loaded: ${img.width}x${img.height}\n`;
          URL.revokeObjectURL(objectUrl);
          resolve(result);
        };
        
        img.onerror = (e) => {
          console.error(`❌ Image ${index + 1} failed to load:`, e);
          result.status = 'failed';
          result.details += `Image load error: ${e}\n`;
          URL.revokeObjectURL(objectUrl);
          resolve(result);
        };
        
        img.src = objectUrl;
      });

    } catch (error) {
      console.error(`❌ Test ${index + 1} error:`, error);
      result.status = 'error';
      result.details += `Exception: ${error}\n`;
      return result;
    }
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    const results = await Promise.all(
      testUrls.map((url, index) => testImage(url, index))
    );
    
    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-red-50 mb-4">
      <h3 className="font-bold text-lg mb-4">🔗 Image URL Test Panel</h3>
      
      <button
        onClick={runTests}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
      >
        {isLoading ? "Testing..." : "Test Image URLs"}
      </button>
      
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold">Test Results:</h4>
          {testResults.map((result, index) => (
            <div key={index} className="p-3 bg-white rounded border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Image {result.index + 1}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  result.status === 'success' ? 'bg-green-100 text-green-800' :
                  result.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-600 mb-2 break-all">
                {result.url}
              </div>
              <pre className="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap">
                {result.details}
              </pre>
              
              {/* Test direct image display */}
              <div className="mt-2">
                <img
                  src={result.url}
                  alt={`Test ${index + 1}`}
                  className="w-24 h-24 object-cover border rounded"
                  onLoad={() => console.log(`✅ Direct img ${index + 1} loaded`)}
                  onError={(e) => console.error(`❌ Direct img ${index + 1} failed:`, e)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
