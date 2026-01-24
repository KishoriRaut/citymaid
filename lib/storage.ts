"use client";

import { supabaseClient } from "./supabase-client";

// Simple image validation functions (replaces deleted image-optimization.ts)
function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/webp"
  ];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." };
  }
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File size must be less than 5MB." };
  }
  
  return { valid: true };
}

function optimizeImage(file: File): Promise<File> {
  // Simple pass-through optimization since we removed the complex optimization
  return Promise.resolve(file);
}

const BUCKET_NAME = "post-photos";
const PAYMENT_RECEIPTS_BUCKET = "payment-receipts";

// Validate payment receipt file (images or PDF)
export function validateReceiptFile(file: File): { valid: boolean; error?: string } {
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

// Upload payment receipt to Supabase Storage
export async function uploadPaymentReceipt(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file first
    const validation = validateReceiptFile(file);
    if (!validation.valid) {
      return { url: null, error: validation.error || "Invalid file" };
    }

    // Optimize image if it's an image (not PDF)
    let fileToUpload: File = file;
    if (file.type.startsWith("image/")) {
      try {
        fileToUpload = await optimizeImage(file);
      } catch (optimizeError) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error optimizing image:", optimizeError);
        }
        // If optimization fails, use original file
        fileToUpload = file;
      }
    }

    // Generate unique filename
    const fileExt = fileToUpload.name.split(".").pop();
    const fileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload file to payment-receipts bucket
    const { error: uploadError } = await supabaseClient.storage
      .from(PAYMENT_RECEIPTS_BUCKET)
      .upload(filePath, fileToUpload, {
        cacheControl: "3600",
        upsert: false,
        contentType: fileToUpload.type,
      });

    if (uploadError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error uploading file:", uploadError);
      }
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from(PAYMENT_RECEIPTS_BUCKET).getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in uploadPaymentReceipt:", error);
    }
    return { url: null, error: "Failed to upload receipt" };
  }
}

// Upload photo to Supabase Storage with optimization
export async function uploadPhoto(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { url: null, error: validation.error || "Invalid image file" };
    }

    // Optimize image before upload
    let optimizedFile: File;
    try {
      optimizedFile = await optimizeImage(file);
    } catch (optimizeError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error optimizing image:", optimizeError);
      }
      // If optimization fails, use original file
      optimizedFile = file;
    }

    // Generate unique filename
    const fileExt = optimizedFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload optimized file
    const { error: uploadError } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, optimizedFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: optimizedFile.type,
      });

    if (uploadError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error uploading file:", uploadError);
      }
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in uploadPhoto:", error);
    }
    return { url: null, error: "Failed to upload photo" };
  }
}
