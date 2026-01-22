"use client";

import { supabaseClient } from "./supabase-client";
import { optimizeImage, validateImageFile } from "./image-optimization";

const BUCKET_NAME = "post-photos";

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
