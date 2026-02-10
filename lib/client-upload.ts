"use client";

// Client-side upload helper - NO Supabase imports
export async function uploadPaymentReceiptClient(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        url: null,
        error: "Please upload a valid file (JPEG, PNG, WebP image or PDF)",
      };
    }

    if (file.size > MAX_SIZE) {
      return {
        url: null,
        error: "File size must be less than 5MB",
      };
    }

    // Build FormData and call API
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-payment-receipt', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { url: null, error: errorData.error || 'Upload failed' };
    }

    const result = await response.json();
    
    if (!result.success) {
      return { url: null, error: result.error || 'Upload failed' };
    }

    console.log("✅ Receipt uploaded successfully via API:", result.url);
    return { url: result.url, error: null };

  } catch (error) {
    console.error("❌ Error in uploadPaymentReceiptClient:", error);
    return { url: null, error: "Failed to upload receipt" };
  }
}
