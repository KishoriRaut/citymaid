"use client";

import { supabaseClient, isSupabaseConfigured } from "./supabase-client";
import { createClient } from "@supabase/supabase-js";
import type { PostWithMaskedContact } from "./types";
import { maskContact } from "./utils";
import { getPostedTimeDays, getPostedDateRange } from "./posted-time";

// Get public posts with pagination
export async function getPublicPostsClient(
  page: number = 1, 
  limit: number = 12, 
  postType?: "all" | "employer" | "employee",
  postedTimeFilter?: string
) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured || !supabaseClient) {
      console.error(" Supabase not configured - missing environment variables");
      return {
        posts: [],
        total: 0,
        currentPage: page,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        error: "Supabase environment variables are missing. Please check Vercel configuration.",
      };
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    console.log(`🔍 Loading page ${page} with limit ${limit} (offset: ${offset})`);
    
    // Get total count first with post_type filter
    let countQuery = supabaseClient
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved');
    
    // Apply post_type filter if specified
    if (postType && postType !== "all") {
      countQuery = countQuery.eq('post_type', postType);
    }
    
    // Apply posted time filter if specified
    if (postedTimeFilter && postedTimeFilter !== "all") {
      const days = getPostedTimeDays(postedTimeFilter);
      console.log(`🔍 Posted time filter: ${postedTimeFilter}, days: ${days}`);
      if (days > 0) {
        const { startDate } = getPostedDateRange(days);
        console.log(`📅 Filtering posts from: ${startDate.toISOString()}`);
        countQuery = countQuery.gte('created_at', startDate.toISOString());
      }
    } else {
      console.log(`🔍 No posted time filter applied (postedTimeFilter: ${postedTimeFilter})`);
    }
    
    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('❌ Count query error:', countError);
      return {
        posts: [],
        total: 0,
        currentPage: page,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        error: countError.message,
      };
    }

    // Get paginated data with post_type filter
    let dataQuery = supabaseClient
      .from('posts')
      .select(`
        id,
        post_type,
        work,
        time,
        place,
        salary,
        contact,
        details,
        photo_url,
        employee_photo,
        status,
        created_at
      `)
      .eq('status', 'approved');
    
    // Apply post_type filter if specified
    if (postType && postType !== "all") {
      dataQuery = dataQuery.eq('post_type', postType);
    }
    
    // Apply posted time filter if specified
    if (postedTimeFilter && postedTimeFilter !== "all") {
      const days = getPostedTimeDays(postedTimeFilter);
      console.log(`🔍 Data query - Posted time filter: ${postedTimeFilter}, days: ${days}`);
      if (days > 0) {
        const { startDate } = getPostedDateRange(days);
        console.log(`📅 Data query filtering posts from: ${startDate.toISOString()}`);
        dataQuery = dataQuery.gte('created_at', startDate.toISOString());
      }
    } else {
      console.log(`🔍 Data query - No posted time filter applied (postedTimeFilter: ${postedTimeFilter})`);
    }
    
    const { data, error } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Direct query error:', error);
      return {
        posts: [],
        total: totalCount || 0,
        currentPage: page,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        error: error.message,
      };
    }

    // Transform data with contact masking
    const transformedPosts = data.map((post: any) => ({
      ...post,
      contact: post.contact ? maskContact(post.contact) : null,
      can_view_contact: false, // Always false for public
      homepage_payment_status: 'approved' as 'approved',
      payment_proof: null,
    }));
    
    // Calculate pagination info
    const totalPages = Math.ceil((totalCount || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log(`✅ Loaded ${transformedPosts.length} posts (Page ${page} of ${totalPages})`);
    
    return {
      posts: transformedPosts,
      total: totalCount || 0,
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPrevPage,
      error: null,
    };
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return {
      posts: [],
      total: 0,
      currentPage: page,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
      error: err instanceof Error ? err.message : 'Failed to load posts',
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
  return posts.map((post, index) => {
    const postData = post as any;
    
    // Apply client-side contact masking - contacts are locked by default
    const isContactLocked = true; // All contacts are locked by default
    
    const transformedPost = {
      id: postData.id,
      post_type: postData.post_type,
      work: postData.work,
      time: postData.time,
      place: postData.place,
      salary: postData.salary,
      contact: isContactLocked ? maskContact(postData.contact) : postData.contact,
      details: postData.details || "",
      photo_url: postData.photo_url,
      employee_photo: postData.employee_photo || null,
      status: postData.status,
      created_at: postData.created_at,
      can_view_contact: !isContactLocked, // Always false for now
      homepage_payment_status: postData.homepage_payment_status || "none",
      payment_proof: postData.payment_proof || null,
    };
    
    return transformedPost;
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
