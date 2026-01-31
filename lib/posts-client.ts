"use client";

import { supabaseClient, isSupabaseConfigured } from "./supabase-client";
import { createClient } from "@supabase/supabase-js";
import type { PostWithMaskedContact } from "./types";
import { maskContact } from "./utils";

// Get public posts - SIMPLE DIRECT APPROACH
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

    // SIMPLE DIRECT APPROACH: Query posts table directly
    console.log("🔍 SIMPLE APPROACH: Direct posts table query...");
    
    const { data, error } = await supabaseClient
      .from('posts')
      .select(`
        id,
        post_type,
        work,
        time,
        place,
        salary,
        contact,
        photo_url,
        employee_photo,
        status,
        created_at
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Direct query error:', error);
      return {
        posts: [],
        total: 0,
        error: `Direct query error: ${error.message}`,
      };
    }

    if (data && data.length > 0) {
      console.log(`✅ Direct query successful: ${data.length} posts`);
      
      // Transform data with contact masking
      const transformedPosts = data.map((post: any) => ({
        ...post,
        contact: post.contact ? maskContact(post.contact) : null,
        can_view_contact: false, // Always false for public
        homepage_payment_status: 'approved' as 'approved',
        payment_proof: null,
      }));
      
      // Debug photo data
      transformedPosts.forEach((post, index) => {
        console.log(`🖼️ Post ${index + 1} from direct query:`, {
          id: post.id,
          post_type: post.post_type,
          work: post.work,
          photo_url: post.photo_url,
          employee_photo: post.employee_photo,
          has_photo_url: !!post.photo_url,
          has_employee_photo: !!post.employee_photo
        });
      });
      
      return {
        posts: transformedPosts,
        total: transformedPosts.length,
        error: null,
      };
    }

    return {
      posts: [],
      total: 0,
      error: "No approved posts found",
    };
  } catch (error) {
    console.error("Error loading posts:", error);
    return {
      posts: [],
      total: 0,
      error: "Failed to load posts",
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
  console.log(`🔄 TransformPosts: Processing ${posts.length} posts`);
  
  return posts.map((post, index) => {
    const postData = post as any;
    // Apply client-side contact masking - contacts are locked by default
    const isContactLocked = true; // All contacts are locked by default
    
    console.log(`🖼️ Post ${index + 1} Debug:`, {
      id: postData.id,
      post_type: postData.post_type,
      work: postData.work,
      photo_url: postData.photo_url,
      employee_photo: postData.employee_photo,
      photo_url_type: typeof postData.photo_url,
      employee_photo_type: typeof postData.employee_photo,
      has_photo_url: !!postData.photo_url,
      has_employee_photo: !!postData.employee_photo
    });
    
    // Test if photo URL is accessible
    if (postData.photo_url) {
      console.log(`🔗 Testing photo URL accessibility:`, postData.photo_url);
    }
    if (postData.employee_photo) {
      console.log(`🔗 Testing employee photo URL accessibility:`, postData.employee_photo);
    }
    
    const transformedPost = {
      id: postData.id,
      post_type: postData.post_type,
      work: postData.work,
      time: postData.time,
      place: postData.place,
      salary: postData.salary,
      contact: isContactLocked ? maskContact(postData.contact) : postData.contact,
      photo_url: postData.photo_url,
      employee_photo: postData.employee_photo || null,
      status: postData.status,
      created_at: postData.created_at,
      can_view_contact: !isContactLocked, // Always false for now
      homepage_payment_status: postData.homepage_payment_status || "none",
      payment_proof: postData.payment_proof || null,
    };
    
    console.log(`✅ Transformed Post ${index + 1}:`, {
      id: transformedPost.id,
      post_type: transformedPost.post_type,
      employee_photo: transformedPost.employee_photo,
      photo_url: transformedPost.photo_url
    });
    
    return transformedPost;
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
