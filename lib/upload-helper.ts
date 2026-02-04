"use client";

interface UploadResult {
  url: string | null;
  error: string | null;
}

export async function uploadReceipt(file: File): Promise<UploadResult> {
  try {
    // Basic validation
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];

    if (!file) {
      return { url: null, error: 'No file selected' };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { 
        url: null, 
        error: 'Invalid file type. Please upload an image or PDF.' 
      };
    }

    if (file.size > MAX_SIZE) {
      return { 
        url: null, 
        error: 'File is too large. Maximum size is 5MB.' 
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-receipt', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        url: null, 
        error: result.error || 'Upload failed' 
      };
    }

    return { 
      url: result.url, 
      error: null 
    };

  } catch (error) {
    console.error('Upload error:', error);
    return { 
      url: null, 
      error: error instanceof Error ? error.message : 'Failed to upload file' 
    };
  }
}
