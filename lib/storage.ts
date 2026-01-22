"use client";

import { supabaseClient } from "./supabase-client";

const BUCKET_NAME = "post-photos";

// Upload photo to Supabase Storage
export async function uploadPhoto(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload file
    const { error: uploadError } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("Error in uploadPhoto:", error);
    return { url: null, error: "Failed to upload photo" };
  }
}
