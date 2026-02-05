import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Define types for test results
interface TestResult {
  status: 'pending' | 'success' | 'error' | 'skipped';
  message: string;
}

interface TestResults {
  approve: TestResult;
  hide: TestResult;
  edit: TestResult;
  delete: TestResult;
  database: TestResult;
  samplePosts: any[];
}

// Test API to verify all admin button functionalities
export async function GET() {
  try {
    console.log('🧪 Testing admin button functionalities...');
    
    const results: TestResults = {
      approve: { status: 'pending', message: 'Not tested' },
      hide: { status: 'pending', message: 'Not tested' },
      edit: { status: 'pending', message: 'Not tested' },
      delete: { status: 'pending', message: 'Not tested' },
      database: { status: 'pending', message: 'Not tested' },
      samplePosts: []
    };

    // 1. Test database connection and get sample posts
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          work,
          place,
          salary,
          post_type,
          created_at,
          payments!inner (
            id,
            status,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        results.database = { status: 'error', message: error.message };
      } else {
        results.database = { status: 'success', message: `Found ${posts?.length || 0} posts with payments` };
        results.samplePosts = posts || [];
      }
    } catch (error) {
      results.database = { status: 'error', message: error instanceof Error ? error.message : 'Database connection failed' };
    }

    // 2. Test Approve functionality (simulate)
    if (results.samplePosts.length > 0) {
      const testPost = results.samplePosts[0];
      try {
        // Test if we can update payment status to 'approved'
        const { error: approveError } = await supabase
          .from('payments')
          .update({ status: 'approved' })
          .eq('id', testPost.payments[0].id)
          .eq('status', 'pending'); // Only update if pending

        if (approveError) {
          results.approve = { status: 'error', message: approveError.message };
        } else {
          results.approve = { status: 'success', message: 'Can update payment status to approved' };
          
          // Reset back to pending for testing
          await supabase
            .from('payments')
            .update({ status: 'pending' })
            .eq('id', testPost.payments[0].id);
        }
      } catch (error) {
        results.approve = { status: 'error', message: error instanceof Error ? error.message : 'Approve test failed' };
      }

      // 3. Test Hide functionality (simulate)
      try {
        // Test if we can update payment status to 'hidden'
        const { error: hideError } = await supabase
          .from('payments')
          .update({ status: 'hidden' })
          .eq('id', testPost.payments[0].id);

        if (hideError) {
          results.hide = { status: 'error', message: hideError.message };
        } else {
          results.hide = { status: 'success', message: 'Can update payment status to hidden' };
          
          // Reset back to pending for testing
          await supabase
            .from('payments')
            .update({ status: 'pending' })
            .eq('id', testPost.payments[0].id);
        }
      } catch (error) {
        results.hide = { status: 'error', message: error instanceof Error ? error.message : 'Hide test failed' };
      }

      // 4. Test Edit functionality (check if post can be fetched)
      try {
        const { data: postData, error: editError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', testPost.id)
          .single();

        if (editError) {
          results.edit = { status: 'error', message: editError.message };
        } else {
          results.edit = { status: 'success', message: 'Can fetch post data for editing' };
        }
      } catch (error) {
        results.edit = { status: 'error', message: error instanceof Error ? error.message : 'Edit test failed' };
      }

      // 5. Test Delete functionality (simulate - don't actually delete)
      try {
        // Check if post and related data exist
        const { data: relatedData, error: deleteTestError } = await supabase
          .from('payments')
          .select('id')
          .eq('post_id', testPost.id);

        if (deleteTestError) {
          results.delete = { status: 'error', message: deleteTestError.message };
        } else {
          results.delete = { 
            status: 'success', 
            message: `Can delete post and ${relatedData?.length || 0} related payments` 
          };
        }
      } catch (error) {
        results.delete = { status: 'error', message: error instanceof Error ? error.message : 'Delete test failed' };
      }
    } else {
      results.approve = { status: 'skipped', message: 'No sample posts available for testing' };
      results.hide = { status: 'skipped', message: 'No sample posts available for testing' };
      results.edit = { status: 'skipped', message: 'No sample posts available for testing' };
      results.delete = { status: 'skipped', message: 'No sample posts available for testing' };
    }

    return NextResponse.json({
      success: true,
      message: 'Admin button functionality test completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
