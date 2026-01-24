"use client";

import { supabaseClient } from "./supabase-client";
import type { PostWithMaskedContact } from "./types";

// Get public posts (client-side version for public pages)
export async function getPublicPostsClient(filters?: {
  post_type?: "employer" | "employee";
  work?: string;
  limit?: number;
  offset?: number;
  viewer_user_id?: string | null;
  visitor_id?: string | null;
}) {
  try {
    // Use the optimized get_public_posts function directly
    const { data, error } = await supabaseClient.rpc("get_public_posts", {
      p_post_type: filters?.post_type || null,
      p_work: filters?.work === "All" ? null : filters?.work,
      p_place: null,
      p_limit: filters?.limit || 50,
      p_offset: filters?.offset || 0,
      p_viewer_user_id: filters?.viewer_user_id || filters?.visitor_id || null
    });

    if (error) {
      console.error("Error fetching public posts:", error);
      return {
        posts: [],
        total: 0,
        error: `Failed to fetch posts: ${error.message}`,
      };
    }

    // Transform data to match PostWithMaskedContact interface
    const posts = (data || []).map((p: any) => ({
      id: p.id,
      post_type: p.post_type,
      work: p.work,
      time: p.time,
      place: p.place,
      salary: p.salary,
      contact: p.contact,
      photo_url: p.photo_url,
      status: p.status,
      homepage_payment_status: p.homepage_payment_status,
      created_at: p.created_at,
      contact_visible: p.contact_visible
    }));

    return {
      posts: posts as PostWithMaskedContact[],
      total: posts.length,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error in getPublicPostsClient:", error);
    return {
      posts: [],
      total: 0,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
