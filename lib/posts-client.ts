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
    // Force API fallback to ensure posts show up
    console.log("🟡 Forcing API fallback to ensure posts display correctly");
    return await getPostsFromAPI(page, limit, postType, postedTimeFilter);
    
    // Original logic (commented out for now)
    // if (isSupabaseConfigured && supabaseClient) {
    //   console.log("🟢 Using client-side Supabase");
    //   return await getPostsFromClient(page, limit, postType, postedTimeFilter);
    // } else {
    //   console.log("🟡 Client-side Supabase not configured, using API fallback");
    //   return await getPostsFromAPI(page, limit, postType, postedTimeFilter);
    // }
  } catch (error) {
    console.error("❌ Error in getPublicPostsClient:", error);
    return {
      posts: [],
      total: 0,
      currentPage: page,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
      error: error instanceof Error ? error.message : "Failed to fetch posts",
    };
  }
}

// Client-side Supabase implementation
async function getPostsFromClient(
  page: number = 1, 
  limit: number = 12, 
  postType?: "all" | "employer" | "employee",
  postedTimeFilter?: string
) {
  // Calculate offset for pagination
  const offset = (page - 1) * limit;
  
  console.log(`🔍 Loading page ${page} with limit ${limit} (offset: ${offset})`);
  
  // Get total count first with post_type filter
  let countQuery = supabaseClient!
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .neq('status', 'hidden');
  
  // Apply post_type filter if specified
  if (postType && postType !== "all") {
    countQuery = countQuery.eq('post_type', postType);
  }
  
  // Apply posted time filter if specified
  if (postedTimeFilter && postedTimeFilter !== "all") {
    const days = getPostedTimeDays(postedTimeFilter);
    if (days > 0) {
      const { startDate } = getPostedDateRange(days);
      countQuery = countQuery.gte('created_at', startDate.toISOString());
    }
  }
  
  const { count: totalCount, error: countError } = await countQuery;

  if (countError) {
    console.error('❌ Count query error:', countError);
    throw new Error(countError.message);
  }

  // Get paginated data with post_type filter
  let dataQuery = supabaseClient!
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
    .eq('status', 'approved')
    .neq('status', 'hidden');
  
  // Apply post_type filter if specified
  if (postType && postType !== "all") {
    dataQuery = dataQuery.eq('post_type', postType);
  }
  
  // Apply posted time filter if specified
  if (postedTimeFilter && postedTimeFilter !== "all") {
    const days = getPostedTimeDays(postedTimeFilter);
    if (days > 0) {
      const { startDate } = getPostedDateRange(days);
      dataQuery = dataQuery.gte('created_at', startDate.toISOString());
    }
  }
  
  const { data, error } = await dataQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('❌ Data query error:', error);
    throw new Error(error.message);
  }

  // Mask contact info for public posts
  const maskedPosts = (data || []).map((post: any) => ({
    ...post,
    contact: maskContact(post.contact)
  }));

  // Calculate pagination info
  const totalPages = Math.ceil((totalCount || 0) / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  console.log(`✅ Client-side fetched ${maskedPosts.length} posts (Page ${page} of ${totalPages})`);
  
  return {
    posts: maskedPosts as PostWithMaskedContact[],
    total: totalCount || 0,
    currentPage: page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    error: null
  };
}

// API fallback implementation
async function getPostsFromAPI(
  page: number = 1, 
  limit: number = 12, 
  postType?: "all" | "employer" | "employee",
  postedTimeFilter?: string
) {
  // Build query parameters
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (postType && postType !== "all") {
    params.append('postType', postType);
  }
  
  if (postedTimeFilter && postedTimeFilter !== "all") {
    params.append('postedTime', postedTimeFilter);
  }

  try {
    const response = await fetch(`/api/public-posts?${params}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log(`✅ API fallback fetched ${result.posts?.length || 0} posts`);
    
    return {
      posts: result.posts || [],
      total: result.total || 0,
      currentPage: result.currentPage || page,
      totalPages: result.totalPages || 0,
      hasNextPage: result.hasNextPage || false,
      hasPrevPage: result.hasPrevPage || false,
      error: result.error || null
    };
  } catch (error) {
    console.error('❌ API fallback error:', error);
    throw error;
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
