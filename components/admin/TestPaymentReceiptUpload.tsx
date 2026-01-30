"use client";

import { useState } from "react";
import { uploadPaymentReceipt } from "@/lib/storage";

export function TestPaymentReceiptUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ url: string | null; error: string | null } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const uploadResult = await uploadPaymentReceipt(file);
      setResult(uploadResult);
    } catch (error) {
      setResult({ url: null, error: error instanceof Error ? error.message : 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border max-w-md">
      <h3 className="text-lg font-semibold mb-4">🧪 Test Payment Receipt Upload</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Receipt File (JPEG, PNG, WebP, PDF - Max 5MB)
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {file && (
          <div className="text-sm text-gray-600">
            <p>Selected: {file.name}</p>
            <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p>Type: {file.type}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload to payment-receipts bucket'}
        </button>

        {result && (
          <div className={`p-4 rounded ${result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            {result.error ? (
              <div>
                <p className="text-red-800 font-medium">❌ Upload Failed</p>
                <p className="text-red-600 text-sm">{result.error}</p>
              </div>
            ) : (
              <div>
                <p className="text-green-800 font-medium">✅ Upload Successful</p>
                <p className="text-green-600 text-sm break-all">URL: {result.url}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
