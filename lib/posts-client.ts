"use client";

import { supabaseClient } from "./supabase-client";

export interface Post {
  id: string;
  post_type: "employer" | "employee";
  work: string;
  time: string;
  place: string;
  salary: string;
  contact: string;
  photo_url: string | null;
  status: "pending" | "approved" | "hidden";
  created_at: string;
}

export interface PostWithMaskedContact extends Omit<Post, "contact"> {
  contact: string | null; // null if payment not approved, otherwise the actual contact
}

// Get public posts (client-side version for public pages)
export async function getPublicPostsClient(filters?: {
  post_type?: "employer" | "employee";
  work?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    console.log("🔍 Attempting to fetch posts via RPC...");
    
    // First, try the RPC function
    const { data: rpcData, error: rpcError } = await supabaseClient.rpc("get_public_posts");

    if (rpcError) {
      console.error("❌ RPC Error:", rpcError);
      console.error("Error code:", rpcError.code);
      console.error("Error message:", rpcError.message);
      
      // If function doesn't exist, try direct query as fallback
      if (rpcError.code === "42883" || rpcError.message?.includes("does not exist")) {
        console.warn("⚠️ RPC function not found, trying direct query fallback...");
        
        // Fallback: Direct query (will only work if RLS allows it)
        const { data: directData, error: directError } = await supabaseClient
          .from("posts")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (directError) {
          console.error("❌ Direct query also failed:", directError);
          return {
            posts: [],
            total: 0,
            error: `Function not found. Direct query also failed: ${directError.message}. Please run the SQL setup script.`,
          };
        }

        console.log("✅ Direct query succeeded, masking contacts...");
        // Mask all contacts in fallback mode (no payment check)
        const fallbackPosts = (directData || []).map((p) => ({
          ...p,
          contact: null, // Hide contacts in fallback
        })) as PostWithMaskedContact[];

        let posts = fallbackPosts;
        // Apply filters
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

    console.log("✅ RPC call succeeded, got", rpcData?.length || 0, "posts");
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
    console.error("Error in getPublicPostsClient:", error);
    return { posts: [], total: 0, error: "Failed to fetch posts" };
  }
}
