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

    // Try RPC function first (most secure)
    console.log("🔍 Calling get_public_posts RPC...");
    const { data: approvedPosts, error: approvedError } = await supabaseClient
      .rpc("get_public_posts", {} as any);  // Explicitly pass empty object to resolve ambiguity

    if (approvedError) {
      console.error("❌ RPC Error details:", approvedError);
      console.error("Error code:", approvedError.code);
      console.error("Error message:", approvedError.message);
      
      // If RPC function doesn't exist or has ambiguity, try direct query as fallback
      if (approvedError.code === '42883' || approvedError.code === 'PGRST203' || 
          approvedError.message?.includes('does not exist') || 
          approvedError.message?.includes('Could not choose the best candidate function')) {
        console.log("🔄 RPC function issue detected, trying direct query fallback...");
        return await getDirectQueryFallback();
      }
      
      return {
        posts: [],
        total: 0,
        error: `RPC Error: ${approvedError.message} (Code: ${approvedError.code})`,
      };
    }

    // If approved posts exist, return them with client-side masking
    if (approvedPosts && approvedPosts.length > 0) {
      console.log(`Found ${approvedPosts.length} approved posts`);
      const posts = transformPosts(approvedPosts as any[]);
      return {
        posts,
        total: posts.length,
        error: null,
      };
    }

    // If no approved posts, try direct query fallback
    console.log("No approved posts found, trying direct query fallback...");
    return await getDirectQueryFallback();

  } catch (error) {
    console.error("Unexpected error in getPublicPostsClient:", error);
    return {
      posts: [],
      total: 0,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}

// Fallback function using direct query (less secure but works if RPC fails)
async function getDirectQueryFallback() {
  try {
    console.log("🔄 Using direct query fallback...");
    if (!supabaseClient) {
      throw new Error("Supabase client not initialized");
    }
    
    const { data: posts, error: postsError } = await supabaseClient
      .from("posts")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);

    if (postsError) {
      console.error("❌ Direct query error:", postsError);
      return {
        posts: [],
        total: 0,
        error: `Direct query failed: ${postsError.message}`,
      };
    }

    console.log(`✅ Direct query found ${(posts || []).length} posts`);
    const transformedPosts = transformPosts((posts || []) as any[]);
    return {
      posts: transformedPosts,
      total: transformedPosts.length,
      error: null,
    };
  } catch (error) {
    console.error("❌ Fallback function error:", error);
    return {
      posts: [],
      total: 0,
      error: `Fallback failed: ${error instanceof Error ? error.message : 'Unknown'}`,
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
    
    // Log photo URL for debugging
    console.log(`🖼️ Post photo_url:`, postData.photo_url);
    console.log(`🖼️ Post photo_url type:`, typeof postData.photo_url);
    console.log(`🖼️ Post photo_url length:`, postData.photo_url?.length);
    
    // Test if photo URL is accessible
    if (postData.photo_url) {
      console.log(`🔗 Testing photo URL accessibility:`, postData.photo_url);
      // Note: We'll test this in browser console
    }
    
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
