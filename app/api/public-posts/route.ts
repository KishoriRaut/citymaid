import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

interface Post {
  id: string;
  post_type: string;
  status: string;
  contact?: string;
  [key: string]: any;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const postType = searchParams.get('postType') || 'all';
    const offset = (page - 1) * limit;

    // Build the base query
    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('status', 'approved');

    // Apply post type filter if specified
    if (postType !== 'all') {
      query = query.eq('post_type', postType);
    }

    // Add pagination and ordering
    console.log('🔍 API Query:', {
      postType,
      limit,
      offset,
      status: 'approved'
    });
    
    const { data, count, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    console.log('📊 API Results:', {
      count,
      dataLength: data?.length || 0,
      error: error?.message
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch posts',
          details: error.message,
          code: error.code || 'DB_ERROR'
        },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Mask contact information for privacy
    const maskedData = (data || []).map((post: Post) => ({
      ...post,
      contact: post.contact 
        ? post.contact.length >= 4 
          ? `${post.contact.substring(0, 2)}***${post.contact.substring(post.contact.length - 2)}`
          : '***'
        : '***'
    }));

    return NextResponse.json({
      posts: maskedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Unexpected error in /api/public-posts:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
