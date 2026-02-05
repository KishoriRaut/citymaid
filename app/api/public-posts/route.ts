import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { maskContact } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const postType = searchParams.get('postType') as "all" | "employer" | "employee" | undefined;
    const postedTimeFilter = searchParams.get('postedTime') || undefined;

    console.log(`🏠 Public posts API: Page ${page}, Limit ${limit}, Type: ${postType}, Time: ${postedTimeFilter}`);

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count first
    let countQuery = supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .neq('status', 'hidden');

    console.log(`🔍 Count query: status=approved, status!=hidden`);

    // Apply post_type filter if specified
    if (postType && postType !== "all") {
      countQuery = countQuery.eq('post_type', postType);
      console.log(`🔍 Applied post_type filter: ${postType}`);
    }

    // Apply posted time filter if specified
    if (postedTimeFilter && postedTimeFilter !== "all") {
      const days = getPostedTimeDays(postedTimeFilter);
      if (days > 0) {
        const { startDate } = getPostedDateRange(days);
        countQuery = countQuery.gte('created_at', startDate.toISOString());
        console.log(`🔍 Applied time filter: ${postedTimeFilter} (${days} days)`);
      }
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('❌ Count query error:', countError);
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    console.log(`✅ Count query result: ${totalCount} total posts`);

    // Get paginated data
    let dataQuery = supabase
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

    console.log(`🔍 Data query: status=approved, status!=hidden`);

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Data query result: ${data?.length || 0} posts returned`);

    // Mask contact info for public posts
    const maskedPosts = (data || []).map(post => ({
      ...post,
      contact: maskContact(post.contact)
    }));

    // Calculate pagination info
    const totalPages = Math.ceil((totalCount || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log(`✅ Public posts API: Returning ${maskedPosts.length} posts (Page ${page} of ${totalPages})`);

    return NextResponse.json({
      posts: maskedPosts,
      total: totalCount || 0,
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPrevPage,
      error: null
    });

  } catch (error) {
    console.error('❌ Public posts API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper functions (copied from posted-time.ts to avoid import issues)
function getPostedTimeDays(filter: string): number {
  switch (filter) {
    case '1day': return 1;
    case '3days': return 3;
    case '1week': return 7;
    case '2weeks': return 14;
    case '1month': return 30;
    default: return 0;
  }
}

function getPostedDateRange(days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
}
