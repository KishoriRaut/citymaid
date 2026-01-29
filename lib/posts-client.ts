"use client";

import { supabaseClient, isSupabaseConfigured } from "./supabase-client";
import type { PostWithMaskedContact } from "./types";
import { maskContact } from "./utils";

// Get public posts (client-side version for public pages)
export async function getPublicPostsClient() {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured || !supabaseClient) {
      console.error(" Supabase not configured - missing environment variables");
      return {
        posts: [],
        total: 0,
        error: "Supabase environment variables are missing. Please check Vercel configuration.",
      };
    }

    // Get approved posts from the database
    const { data: approvedPosts, error: approvedError } = await supabaseClient
      .from("posts")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);

    if (approvedError) {
      console.error("Error fetching approved posts:", approvedError);
      return {
        posts: [],
        total: 0,
        error: `Database error: ${approvedError.message}`,
      };
    }

    // If approved posts exist, return them with client-side masking
    if (approvedPosts && approvedPosts.length > 0) {
      console.log(`Found ${approvedPosts.length} approved posts`);
      const posts = transformPosts(approvedPosts as unknown[]);
      return {
        posts,
        total: posts.length,
        error: null,
      };
    }

    // If no approved posts, get status distribution for debugging
    console.log("No approved posts found, checking status distribution...");
    const { data: statusData, error: statusError } = await supabaseClient
      .from("posts")
      .select("status")
      .limit(100);

    if (statusError) {
      console.error("Error getting status distribution:", statusError);
    } else if (statusData && statusData.length > 0) {
      const statusCount = statusData.reduce((acc: Record<string, number>, post: { status: string }) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      }, {});
      console.log("Status distribution:", statusCount);
    }

    // Fallback: get any posts from the database
    const { data: anyPosts, error: anyPostsError } = await supabaseClient
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (anyPostsError) {
      console.error("Error fetching any posts:", anyPostsError);
      return {
        posts: [],
        total: 0,
        error: `Database error: ${anyPostsError.message}`,
      };
    }

    console.log(`Found ${anyPosts?.length || 0} posts with any status`);
    const posts = transformPosts((anyPosts || []) as unknown[]);
    return {
      posts,
      total: posts.length,
      error: null,
    };

  } catch (error) {
    console.error("Unexpected error in getPublicPostsClient:", error);
    return {
      posts: [],
      total: 0,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}

// Transform posts data to match PostWithMaskedContact interface
/* eslint-disable @typescript-eslint/no-explicit-any */
function transformPosts(posts: unknown[]): PostWithMaskedContact[] {
  return posts.map((post) => {
    const postData = post as any;
    // Apply client-side contact masking - contacts are locked by default
    const isContactLocked = true; // All contacts are locked by default
    return {
      id: postData.id,
      post_type: postData.post_type,
      work: postData.work,
      time: postData.time,
      place: postData.place,
      salary: postData.salary,
      contact: isContactLocked ? maskContact(postData.contact) : postData.contact,
      photo_url: postData.photo_url,
      status: postData.status,
      created_at: postData.created_at,
      can_view_contact: !isContactLocked, // Always false for now
    };
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
