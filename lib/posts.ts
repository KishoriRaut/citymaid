"use server";

import { supabase } from "./supabase";

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

// Get public posts (approved only, with contact protection)
export async function getPublicPosts(filters?: {
  post_type?: "employer" | "employee";
  work?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    // Use the secure function that protects contacts
    const { data, error } = await supabase.rpc("get_public_posts");

    if (error) {
      console.error("Error fetching posts via RPC:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // If function doesn't exist (code 42883), provide helpful message
      if (error.code === "42883" || error.message?.includes("does not exist")) {
        return {
          posts: [],
          total: 0,
          error: "Database function not found. Please run the SQL setup script in Supabase SQL Editor.",
        };
      }

      // For other errors, try direct query as fallback (service_role can bypass RLS)
      console.warn("RPC function failed, attempting direct query fallback");
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return {
          posts: [],
          total: 0,
          error: `RPC failed: ${error.message}. Fallback also failed: ${fallbackError.message}`,
        };
      }

      // Mask contacts in fallback (no payment check)
      const fallbackPosts = (fallbackData || []).map((p) => ({
        ...p,
        contact: null, // Hide contacts in fallback mode
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

    let posts = (data || []) as PostWithMaskedContact[];

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
    console.error("Error in getPublicPosts:", error);
    return { posts: [], total: 0, error: "Failed to fetch posts" };
  }
}

// Create a new post (public)
export async function createPost(post: {
  post_type: "employer" | "employee";
  work: string;
  time: string;
  place: string;
  salary: string;
  contact: string;
  photo_url?: string | null;
}) {
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        ...post,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return { post: null, error: error.message };
    }

    return { post: data as Post, error: null };
  } catch (error) {
    console.error("Error in createPost:", error);
    return { post: null, error: "Failed to create post" };
  }
}

// Get post by ID (admin only - includes contact)
export async function getPostById(postId: string) {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      return { post: null, error: error.message };
    }

    return { post: data as Post, error: null };
  } catch (error) {
    console.error("Error in getPostById:", error);
    return { post: null, error: "Failed to fetch post" };
  }
}

// Get all posts (admin only)
export async function getAllPosts(filters?: {
  status?: "pending" | "approved" | "hidden";
  post_type?: "employer" | "employee";
}) {
  try {
    let query = supabase.from("posts").select("*").order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.post_type) {
      query = query.eq("post_type", filters.post_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      return { posts: [], error: error.message };
    }

    return { posts: (data || []) as Post[], error: null };
  } catch (error) {
    console.error("Error in getAllPosts:", error);
    return { posts: [], error: "Failed to fetch posts" };
  }
}

// Update post status (admin only)
export async function updatePostStatus(postId: string, status: "pending" | "approved" | "hidden") {
  try {
    const { data, error } = await supabase
      .from("posts")
      .update({ status })
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return { post: null, error: error.message };
    }

    return { post: data as Post, error: null };
  } catch (error) {
    console.error("Error in updatePostStatus:", error);
    return { post: null, error: "Failed to update post" };
  }
}

// Delete post (admin only)
export async function deletePost(postId: string) {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      console.error("Error deleting post:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error("Error in deletePost:", error);
    return { error: "Failed to delete post" };
  }
}
