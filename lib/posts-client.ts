"use client";

import { supabaseClient } from "./supabase-client";
import type { PostWithMaskedContact } from "./types";

// Get public posts (client-side version for public pages)
export async function getPublicPostsClient() {
  try {
    // First try to get approved posts
    const { data: approvedPosts, error: approvedError } = await supabaseClient
      .from("posts")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);

    if (approvedError) {
      console.error("Error fetching approved posts:", approvedError);
    }

    // If approved posts exist, return them
    if (approvedPosts && approvedPosts.length > 0) {
      console.log(`Found ${approvedPosts.length} approved posts`);
      const posts = transformPosts(approvedPosts);
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

    // Fallback: get any posts (we'll filter in UI)
    const { data: anyPosts, error: anyPostsError } = await supabaseClient
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (anyPostsError) {
      console.error("Error fetching any posts:", anyPostsError);
      return {
        posts: [],
        total: 0,
        error: `Failed to fetch posts: ${anyPostsError.message}`,
      };
    }

    console.log(`Found ${anyPosts?.length || 0} posts with any status`);
    const posts = transformPosts(anyPosts || []);
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
  return posts.map((post) => ({
    id: (post as any).id,
    post_type: (post as any).post_type,
    work: (post as any).work,
    time: (post as any).time,
    place: (post as any).place,
    salary: (post as any).salary,
    contact: (post as any).contact,
    photo_url: (post as any).photo_url,
    status: (post as any).status,
    homepage_payment_status: (post as any).homepage_payment_status,
    created_at: (post as any).created_at,
    can_view_contact: (post as any).status === 'approved' || false, // Only approved posts show contact
  }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */
