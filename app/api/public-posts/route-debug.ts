import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { maskContact } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    // STEP 1: Defensive logging for input params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '12'));
    const postType = searchParams.get('postType') as "all" | "employer" | "employee" | undefined;
    const postedTimeFilter = searchParams.get('postedTime') || undefined;

    console.log('=== API REQUEST DEBUG ===');
    console.log('🏠 Public posts API: Page', page, 'Limit', limit, 'Type', postType, 'Time', postedTimeFilter);
    console.log('📝 Input params:', { page, limit, postType, postedTimeFilter });
    console.log('📝 Request URL:', request.url);

    // STEP 2: Validate Supabase RPC call
    console.log('🔍 Calling Supabase RPC...');
    const { data, error } = await supabase
      .rpc('get_public_posts', {
        page_param: page,
        limit_param: limit,
        post_type_filter: postType || 'all'
      });

    // STEP 3: Enhanced error handling
    if (error) {
      console.error('❌ Supabase RPC error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      console.error('❌ Error code:', error.code);
      console.error('❌ Error hint:', error.hint);
      return NextResponse.json({ 
        error: 'Database function error',
        details: error.message,
        code: error.code || 'RPC_ERROR',
        hint: error.hint || null
      }, { status: 500 });
    }

    // STEP 4: Validate RPC response data
    if (!data) {
      console.error('❌ RPC returned null data');
      return NextResponse.json({ 
        error: 'RPC returned null data',
        details: 'Supabase RPC call returned null'
      }, { status: 500 });
    }

    console.log('✅ Supabase RPC success');
    console.log('📊 Raw data type:', typeof data);
    console.log('📊 Raw data length:', data?.length);
    console.log('📊 Raw data:', JSON.stringify(data, null, 2));

    // STEP 5: Validate RPC return shape
    if (!Array.isArray(data)) {
      console.error('❌ RPC data is not an array:', typeof data);
      return NextResponse.json({ 
        error: 'Invalid RPC response',
        details: 'Expected array but got ' + typeof data
      }, { status: 500 });
    }

    // STEP 6: Extract result (function returns single row)
    const result = data[0];
    if (!result) {
      console.log('⚠️ No results from API function - data was:', data);
      return NextResponse.json({
        posts: [],
        total: 0,
        currentPage: page,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        error: null
      });
    }

    console.log('✅ Function result extracted');
    console.log('📊 Result type:', typeof result);
    console.log('📊 Result keys:', Object.keys(result));
    console.log('📊 Full result:', JSON.stringify(result, null, 2));

    // STEP 7: Validate result structure
    const validationErrors = [];
    
    if (!result.posts) {
      validationErrors.push('Missing posts field');
    } else if (!Array.isArray(result.posts)) {
      validationErrors.push('Posts field is not an array: ' + typeof result.posts);
    }
    
    if (typeof result.total_count !== 'number') {
      validationErrors.push('total_count is not a number: ' + typeof result.total_count);
    }
    
    if (typeof result.current_page !== 'number') {
      validationErrors.push('current_page is not a number: ' + typeof result.current_page);
    }
    
    if (typeof result.total_pages !== 'number') {
      validationErrors.push('total_pages is not a number: ' + typeof result.total_pages);
    }
    
    if (typeof result.has_next_page !== 'boolean') {
      validationErrors.push('has_next_page is not boolean: ' + typeof result.has_next_page);
    }
    
    if (typeof result.has_prev_page !== 'boolean') {
      validationErrors.push('has_prev_page is not boolean: ' + typeof result.has_prev_page);
    }

    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:', validationErrors);
      return NextResponse.json({
        posts: [],
        total: 0,
        currentPage: page,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        error: 'Validation failed: ' + validationErrors.join(', ')
      }, { status: 500 });
    }

    console.log('✅ All validations passed');
    console.log(`✅ Posts count: ${result.posts?.length || 0}`);
    console.log(`✅ Total count: ${result.total_count}`);
    console.log(`✅ Current page: ${result.current_page}`);
    console.log(`✅ Total pages: ${result.total_pages}`);
    console.log(`✅ Has next: ${result.has_next_page}`);
    console.log(`✅ Has prev: ${result.has_prev_page}`);

    // STEP 8: Validate JSON serialization
    const postsArray = result.posts || [];
    if (!Array.isArray(postsArray)) {
      console.error('❌ Posts is not an array after fallback');
      return NextResponse.json({
        posts: [],
        total: result.total_count || 0,
        currentPage: result.current_page || page,
        totalPages: result.total_pages || 0,
        hasNextPage: result.has_next_page || false,
        hasPrevPage: result.has_prev_page || false,
        error: 'Posts serialization failed'
      }, { status: 500 });
    }

    // STEP 9: Return structured response matching frontend expectation
    const response = {
      posts: postsArray,
      pagination: {
        totalPosts: result.total_count || 0,
        currentPage: result.current_page || page,
        totalPages: result.total_pages || 0,
        hasNext: result.has_next_page || false,
        hasPrevious: result.has_prev_page || false
      },
      error: null
    };

    console.log('✅ Public posts API: Returning structured response');
    console.log('📊 Response:', JSON.stringify(response, null, 2));

    return NextResponse.json(response);

  } catch (error) {
    // STEP 10: Structured error response
    console.error('❌ Public posts API error:', error);
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch posts',
      stack: error instanceof Error ? error.stack : undefined,
      type: error.constructor.name
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
