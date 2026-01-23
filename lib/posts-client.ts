"use client";

import { supabaseClient } from "./supabase-client";
import type { PostWithMaskedContact } from "./types";

// Get public posts (client-side version for public pages)
export async function getPublicPostsClient(filters?: {
  post_type?: "employer" | "employee";
  work?: string;
  limit?: number;
  offset?: number;
  viewer_user_id?: string; // Add viewer user ID for contact visibility
  visitor_id?: string; // Add visitor ID for contact visibility
}) {
  try {
    // Try new function with contact masking based on user access
    const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
      "get_public_posts_with_masked_contacts",
      { viewer_user_id_param: filters?.viewer_user_id || null }
    );

    // If new function doesn't exist, fall back to existing function
    if (rpcError && (rpcError.code === "42883" || rpcError.message?.includes("does not exist"))) {
      console.log("New function not found, using fallback with existing get_public_posts");
      
      const { data: fallbackData, error: fallbackError } = await supabaseClient.rpc("get_public_posts");

      if (fallbackError) {
        if (process.env.NODE_ENV === "development") {
          console.error("Fallback RPC Error:", fallbackError);
        }
        
        // If RPC also fails, try direct query as fallback
        if (fallbackError.code === "42883" || fallbackError.message?.includes("does not exist")) {
          const { data: directData, error: directError } = await supabaseClient
            .from("posts")
            .select("*")
            .eq("status", "approved")
            .order("created_at", { ascending: false });

          if (directError) {
            return {
              posts: [],
              total: 0,
              error: `Function not found. Direct query also failed: ${directError.message}. Please run the SQL setup script.`,
            };
          }

          // Mask all contacts in fallback mode (no payment check)
          const fallbackPosts = (directData || []).map((p) => ({
            ...p,
            contact: null,
            can_view_contact: false, // Add this field for consistency
          })) as PostWithMaskedContact[];

          let posts = fallbackPosts;
          if (filters?.post_type) {
            posts = posts.filter((p) => p.post_type === filters.post_type);
          }
          if (filters?.work) {
            posts = posts.filter((p) => p.work.toLowerCase().includes(filters.work!.toLowerCase()));
          }

          const total = posts.length;
          const limit = filters?.limit || 20;
          const offset = filters?.offset || 0;
          const paginatedPosts = posts.slice(offset, offset + limit);

          return {
            posts: paginatedPosts,
            total,
            error: null,
          };
        }

        return { posts: [], total: 0, error: fallbackError.message };
      }

      // Process fallback data with client-side masking
      let posts = (fallbackData || []).map((p: any) => ({
        ...p,
        can_view_contact: false, // Default to false for fallback
      })) as PostWithMaskedContact[];

      // Apply filters
      if (filters?.post_type) {
        posts = posts.filter((p) => p.post_type === filters.post_type);
      }
      if (filters?.work) {
        posts = posts.filter((p) => p.work.toLowerCase().includes(filters.work!.toLowerCase()));
      }

      // Apply pagination
      const total = posts.length;
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      const paginatedPosts = posts.slice(offset, offset + limit);

      return {
        posts: paginatedPosts,
        total,
        error: null,
      };
    }

    if (rpcError) {
      if (process.env.NODE_ENV === "development") {
        console.error("RPC Error:", rpcError);
      }
      return { posts: [], total: 0, error: rpcError.message };
    }

    let posts = (rpcData || []) as PostWithMaskedContact[];

    // Apply filters
    if (filters?.post_type) {
      posts = posts.filter((p) => p.post_type === filters.post_type);
    }
    if (filters?.work) {
      posts = posts.filter((p) => p.work.toLowerCase().includes(filters.work!.toLowerCase()));
    }

    // Apply pagination
    const total = posts.length;
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    const paginatedPosts = posts.slice(offset, offset + limit);

    return {
      posts: paginatedPosts,
      total,
      error: null,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in getPublicPostsClient:", error);
    }
    return { posts: [], total: 0, error: "Failed to fetch posts" };
  }
}
