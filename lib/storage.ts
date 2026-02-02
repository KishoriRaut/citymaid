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

// Upload payment receipt to Supabase Storage (server-side compatible)
export async function uploadPaymentReceipt(file: File): Promise<{ url: string | null; error: string | null }> {
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

    // Generate unique filename with timestamp and random string
    const fileExt = fileToUpload.name.split(".").pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `receipt-${timestamp}-${randomString}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log("📤 Uploading payment receipt:", {
      originalName: file.name,
      fileName,
      filePath,
      fileSize: fileToUpload.size,
      fileType: fileToUpload.type
    });

    // Check if we're on server-side and import appropriate supabase client
    let supabaseClient;
    if (typeof window === 'undefined') {
      // Server-side - use server supabase client
      const { supabase } = await import('./supabase');
      supabaseClient = supabase;
    } else {
      // Client-side - use client supabase client
      const { supabaseClient: client } = await import('./supabase-client');
      supabaseClient = client;
    }

    if (!supabaseClient) {
      return {
        error: "Supabase client not initialized - missing environment variables",
        url: null
      };
    }
    
    const { error: uploadError } = await supabaseClient.storage
      .from(PAYMENT_RECEIPTS_BUCKET)
      .upload(filePath, fileToUpload, {
        cacheControl: "3600",
        upsert: false,
        contentType: fileToUpload.type,
      });

    if (uploadError) {
      console.error("❌ Storage upload error:", uploadError);
      if (process.env.NODE_ENV === "development") {
        console.error("Error uploading file:", uploadError);
      }
      return { url: null, error: uploadError.message };
    }

    // Get public URL - this will be the exact path stored in database
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from(PAYMENT_RECEIPTS_BUCKET).getPublicUrl(filePath);

    console.log("✅ Receipt uploaded successfully:", publicUrl);

    // Validate the returned URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!publicUrl || !supabaseUrl || !publicUrl.startsWith(supabaseUrl)) {
      console.error("❌ Invalid public URL generated:", publicUrl);
      return { url: null, error: "Failed to generate valid public URL" };
    }

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("❌ Error in uploadPaymentReceipt:", error);
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
    if (!supabaseClient) {
      throw new Error("Supabase client not initialized");
    }
    
    console.log("📤 Uploading to bucket:", BUCKET_NAME);
    console.log("📤 File path:", filePath);
    console.log("📤 File size:", optimizedFile.size);
    console.log("📤 Content type:", optimizedFile.type);
    
    const { error: uploadError } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, optimizedFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: optimizedFile.type,
      });

    if (uploadError) {
      console.error("❌ Upload error details:", uploadError);
      if (process.env.NODE_ENV === "development") {
        console.error("Error uploading file:", uploadError);
      }
      return { url: null, error: uploadError.message };
    }

    console.log("✅ Upload successful!");

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    console.log("🔗 Public URL generated:", publicUrl);

    return { url: publicUrl, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in uploadPhoto:", error);
    }
    return { url: null, error: "Failed to upload photo" };
  }
}
