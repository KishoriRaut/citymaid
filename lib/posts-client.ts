"use client";

import { supabaseClient } from "./supabase-client";
import type { PostWithMaskedContact } from "./types";

// Get public posts (client-side version for public pages)
export async function getPublicPostsClient() {
  // Debug: Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log("Supabase URL configured:", !!supabaseUrl);
  console.log("Supabase Anon Key configured:", !!supabaseAnonKey);
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    return {
      posts: [],
      total: 0,
      error: "Missing Supabase configuration",
    };
  }

  try {
    // First try the RPC function
    const { data, error } = await supabaseClient.rpc("get_public_posts");

    if (error) {
      console.warn("RPC function failed, falling back to direct query:", error);
      
      try {
        // First, let's check what posts exist at all
        const { data: allPosts } = await supabaseClient
          .from("posts")
          .select("status, count")
          .limit(10);

        console.log("Sample posts and their statuses:", allPosts);
        
        // Now try the approved posts query
        const { data: postsData, error: postsError } = await supabaseClient
          .from("posts")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(50);

        if (postsError) {
          console.error("Direct query also failed:", postsError);
          // Return empty array with error message
          return {
            posts: [],
            total: 0,
            error: `RPC failed: ${error.message}. Direct query also failed: ${postsError.message}`,
          };
        }

        console.log("Direct query succeeded, posts count:", postsData?.length || 0);

        // If no approved posts, try to get posts with any status for debugging
        if (!postsData || postsData.length === 0) {
          console.log("No approved posts found, trying to get any posts...");
          const { data: anyPosts, error: anyPostsError } = await supabaseClient
            .from("posts")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

          if (anyPostsError) {
            console.error("Error getting any posts:", anyPostsError);
          } else {
            console.log("Found posts with any status:", anyPosts?.length || 0);
            console.log("Status distribution:", anyPosts?.reduce((acc: Record<string, number>, post: { status: string }) => {
              acc[post.status] = (acc[post.status] || 0) + 1;
              return acc;
            }, {}));
            
            // For now, return any posts (we'll filter by status in the UI)
            const posts = (anyPosts as Array<{
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
              can_view_contact: false // Default to false for direct query
            }));

            console.log("Returning any posts count:", posts.length);

            return {
              posts: posts as PostWithMaskedContact[],
              total: posts.length,
              error: null,
            };
          }
        }

        // Transform data to match PostWithMaskedContact interface
        const posts = (postsData as Array<{
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
          can_view_contact: false // Default to false for direct query
        }));

        console.log("Transformed posts count:", posts.length);

        return {
          posts: posts as PostWithMaskedContact[],
          total: posts.length,
          error: null,
        };
      } catch (fallbackError) {
        console.error("Fallback query threw exception:", fallbackError);
        return {
          posts: [],
          total: 0,
          error: `All fetch methods failed. RPC: ${error.message}. Fallback: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown'}`,
        };
      }
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
