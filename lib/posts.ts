"use server";

import { supabase } from "./supabase";
import type { Post } from "./types";

// Helper function to get user from session
async function getUserFromSession(request?: Request) {
  try {
    // For server actions, we need to get cookies differently
    let cookieHeader = "";
    
    if (request) {
      cookieHeader = request.headers.get("cookie") || "";
    } else {
      // Try to get cookies from headers if available in server context
      const headers = (globalThis as any).headers;
      if (headers) {
        cookieHeader = headers.get("cookie") || "";
      }
    }

    if (!cookieHeader) {
      return null;
    }

    // Parse cookies to find user_session
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    const sessionCookie = cookies["user_session"];
    if (!sessionCookie) {
      return null;
    }

    const sessionUser = JSON.parse(sessionCookie);
    if (!sessionUser?.id) {
      return null;
    }

    // Fetch fresh user data from database
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", sessionUser.id)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting user from session:", error);
    return null;
  }
}

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
}, request?: Request) {
  try {
    // ========================================================================
    // SERVER-SIDE ADMIN ENFORCEMENT
    // ========================================================================
    // Get user from session to determine admin status
    const user = await getUserFromSession(request);
    const isAdmin = user?.role === "admin";
    
    // Determine status based on server-side admin check
    const postStatus: "pending" | "approved" = isAdmin ? "approved" : "pending";
    const homepagePaymentStatus: "none" | "pending" | "approved" | "rejected" = isAdmin ? "approved" : "none";

    // ========================================================================
    // VALIDATION 1: Check for duplicate posts (applies to all users)
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
    // VALIDATION 2: Check active post limits per contact (SKIP FOR ADMINS)
    // ========================================================================
    // Active posts = status IN ('pending', 'approved')
    // Rules for regular users:
    // - Max 2 active posts per post_type per contact
    // - Max 4 total active posts per contact
    // Admins: No limits (unlimited posts)

    if (postStatus !== "approved") {
      // Only apply limits for non-approved posts (regular users)
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
          error: "You already have 2 active posts of this type. Please wait for approval or contact admin.",
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
          error: "You already have 4 active posts. Please wait for approval or contact admin.",
        };
      }
    }

    // ========================================================================
    // VALIDATION PASSED: Create the post
    // ========================================================================
    // Force photo_url = NULL for employer posts (security: prevent client manipulation)
    const postData = {
      ...post,
      photo_url: post.post_type === "employer" ? null : post.photo_url || null,
      status: postStatus, // 'approved' for admins, 'pending' for regular users
      homepage_payment_status: homepagePaymentStatus, // 'approved' for admins, 'none' for regular users
    };

    const { data, error } = await supabase
      .from("posts")
      .insert(postData)
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
    // Use SQL function to get post with masked contact (if payment not approved)
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_post_with_contact_visibility", {
      post_uuid: postId,
    });

    if (rpcError) {
      // Fallback to direct query if function doesn't exist
      if (rpcError.code === "42883" || rpcError.message?.includes("does not exist")) {
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
      }

      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching post via RPC:", rpcError);
      }
      return { post: null, error: rpcError.message };
    }

    // RPC function returns array, get first result
    const postData = Array.isArray(rpcData) && rpcData.length > 0 ? rpcData[0] : null;
    
    if (!postData) {
      return { post: null, error: "Post not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contact_visible, ...post } = postData;
    return { post: post as Post, error: null };
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

// Update post content (admin only)
// Allows admins to edit all post fields except id and created_at
export async function updatePost(
  postId: string,
  updates: {
    post_type?: "employer" | "employee";
    work?: string;
    time?: string;
    place?: string;
    salary?: string;
    contact?: string;
    photo_url?: string | null;
    status?: "pending" | "approved" | "hidden";
  }
) {
  try {
    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (updates.post_type !== undefined) updateData.post_type = updates.post_type;
    if (updates.work !== undefined) updateData.work = updates.work;
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.place !== undefined) updateData.place = updates.place;
    if (updates.salary !== undefined) updateData.salary = updates.salary;
    if (updates.contact !== undefined) updateData.contact = updates.contact;
    if (updates.status !== undefined) updateData.status = updates.status;

    // Handle photo_url: force NULL for employer posts
    if (updates.photo_url !== undefined) {
      const postType = updates.post_type !== undefined ? updates.post_type : undefined;
      // If we're updating post_type to employer, or if it's already employer, set photo_url to null
      if (postType === "employer") {
        updateData.photo_url = null;
      } else {
        // If we don't know the post_type, check the existing post
        const { data: existingPost } = await supabase
          .from("posts")
          .select("post_type")
          .eq("id", postId)
          .single();

        if (existingPost?.post_type === "employer") {
          updateData.photo_url = null;
        } else {
          updateData.photo_url = updates.photo_url;
        }
      }
    }

    // Update the post
    const { data, error } = await supabase
      .from("posts")
      .update(updateData)
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
      console.error("Error in updatePost:", error);
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
