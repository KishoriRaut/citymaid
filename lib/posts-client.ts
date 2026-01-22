"use client";

import { supabaseClient } from "./supabase-client";
import type { PostWithMaskedContact } from "./types";

// Get public posts (client-side version for public pages)
export async function getPublicPostsClient(filters?: {
  post_type?: "employer" | "employee";
  work?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const { data: rpcData, error: rpcError } = await supabaseClient.rpc("get_public_posts");

    if (rpcError) {
      if (process.env.NODE_ENV === "development") {
        console.error("RPC Error:", rpcError);
      }
      
      // If function doesn't exist, try direct query as fallback
      if (rpcError.code === "42883" || rpcError.message?.includes("does not exist")) {
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
