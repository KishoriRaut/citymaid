// Server-side payment receipt upload function
// This avoids the dynamic import issues with client/server detection

import { supabase } from './supabase';

const PAYMENT_RECEIPTS_BUCKET = "payment-receipts";

// Validate payment receipt file (images or PDF)
function validateReceiptFile(file: File): { valid: boolean; error?: string } {
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
      valid: false,
      error: "Please upload a valid file (JPEG, PNG, WebP image or PDF)",
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "File size must be less than 5MB",
    };
  }

  return { valid: true };
}

// Server-side upload payment receipt to Supabase Storage
export async function uploadPaymentReceiptServer(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file first
    const validation = validateReceiptFile(file);
    if (!validation.valid) {
      return { url: null, error: validation.error || "Invalid file" };
    }

    // Additional defensive checks
    if (!file || file.size === 0) {
      return { url: null, error: "Invalid file: File is empty or undefined" };
    }

    if (!file.name || file.name.trim() === '') {
      return { url: null, error: "Invalid file: File name is empty" };
    }

    // Generate unique filename with timestamp and random string
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `receipt-${timestamp}-${randomString}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log("📤 Server-side uploading payment receipt:", {
      originalName: file.name,
      fileName,
      filePath,
      fileSize: file.size,
      fileType: file.type
    });

    if (!supabase) {
      return {
        error: "Supabase client not initialized - missing environment variables",
        url: null
      };
    }
    
    const { error: uploadError } = await supabase.storage
      .from(PAYMENT_RECEIPTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("❌ Server-side storage upload error:", uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get public URL - this will be the exact path stored in database
    const {
      data: { publicUrl },
    } = supabase.storage.from(PAYMENT_RECEIPTS_BUCKET).getPublicUrl(filePath);

    console.log("✅ Server-side receipt uploaded successfully:", publicUrl);

    // Validate the returned URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!publicUrl || !supabaseUrl || !publicUrl.startsWith(supabaseUrl)) {
      console.error("❌ Invalid public URL generated:", publicUrl);
      return { url: null, error: "Failed to generate valid public URL" };
    }

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("❌ Error in server-side uploadPaymentReceipt:", error);
    return { url: null, error: "Failed to upload receipt" };
  }
}
