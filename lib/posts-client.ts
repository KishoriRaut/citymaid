"use client";

import { supabaseClient } from "./supabase-client";
import type { PostWithMaskedContact } from "./types";

// Get public posts (client-side version for public pages)
export async function getPublicPostsClient() {
  try {
    // Use the get_public_posts function without parameters for now
    const { data, error } = await supabaseClient.rpc("get_public_posts");

    if (error) {
      console.error("Error fetching public posts:", error);
      return {
        posts: [],
        total: 0,
        error: `Failed to fetch posts: ${error.message}`,
      };
    }

    // Transform data to match PostWithMaskedContact interface
    const posts = (data as Array<{
      id: string;
      post_type: string;
      work: string;
      time: string;
      place: string;
      salary: string;
      contact: string;
      photo_url: string;
      status: string;
      homepage_payment_status: string;
      created_at: string;
      contact_visible: boolean;
    }> || []).map((p: {
      id: string;
      post_type: string;
      work: string;
      time: string;
      place: string;
      salary: string;
      contact: string;
      photo_url: string;
      status: string;
      homepage_payment_status: string;
      created_at: string;
      contact_visible: boolean;
    }) => ({
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
      can_view_contact: p.contact_visible
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
