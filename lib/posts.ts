"use server";

import { supabase } from "./supabase";
import type { Post } from "./types";

// Create a new post (public)
// Includes spam prevention and duplicate detection
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
    // ========================================================================
    // VALIDATION 1: Check for duplicate posts
    // ========================================================================
    // Prevent posting the same post (same contact + type + work + place)
    // Only check posts that are still active (pending, approved, hidden)
    // Deleted posts won't be found, allowing reposting after deletion
    const { data: duplicateCheck, error: duplicateError } = await supabase
      .from("posts")
      .select("id, status")
      .eq("contact", post.contact)
      .eq("post_type", post.post_type)
      .eq("work", post.work)
      .eq("place", post.place)
      .in("status", ["pending", "approved", "hidden"]);

    if (duplicateError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error checking for duplicates:", duplicateError);
      }
      // Continue with creation if check fails (don't block on validation error)
    } else if (duplicateCheck && duplicateCheck.length > 0) {
      return {
        post: null,
        error: "A similar post already exists.",
      };
    }

    // ========================================================================
    // VALIDATION 2: Check active post limits per contact
    // ========================================================================
    // Active posts = status IN ('pending', 'approved')
    // Rules:
    // - Max 2 active posts per post_type per contact
    // - Max 4 total active posts per contact

    // Count active posts for this contact and post_type
    const { count: activePostsByType, error: countError1 } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("contact", post.contact)
      .eq("post_type", post.post_type)
      .in("status", ["pending", "approved"]);

    if (countError1) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error counting posts by type:", countError1);
      }
      // Continue with creation if check fails
    } else if (activePostsByType !== null && activePostsByType >= 2) {
      return {
        post: null,
        error: "You already have active posts. Please delete or wait for approval.",
      };
    }

    // Count total active posts for this contact
    const { count: totalActivePosts, error: countError2 } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("contact", post.contact)
      .in("status", ["pending", "approved"]);

    if (countError2) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error counting total posts:", countError2);
      }
      // Continue with creation if check fails
    } else if (totalActivePosts !== null && totalActivePosts >= 4) {
      return {
        post: null,
        error: "You already have active posts. Please delete or wait for approval.",
      };
    }

    // ========================================================================
    // VALIDATION PASSED: Create the post
    // ========================================================================
    const { data, error } = await supabase
      .from("posts")
      .insert({
        ...post,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error creating post:", error);
      }
      return { post: null, error: error.message };
    }

    return { post: data as Post, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in createPost:", error);
    }
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
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching post:", error);
      }
      return { post: null, error: error.message };
    }

    return { post: data as Post, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in getPostById:", error);
    }
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
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching posts:", error);
      }
      return { posts: [], error: error.message };
    }

    return { posts: (data || []) as Post[], error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in getAllPosts:", error);
    }
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
      if (process.env.NODE_ENV === "development") {
        console.error("Error updating post:", error);
      }
      return { post: null, error: error.message };
    }

    return { post: data as Post, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in updatePostStatus:", error);
    }
    return { post: null, error: "Failed to update post" };
  }
}

// Delete post (admin only)
export async function deletePost(postId: string) {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error deleting post:", error);
      }
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in deletePost:", error);
    }
    return { error: "Failed to delete post" };
  }
}
