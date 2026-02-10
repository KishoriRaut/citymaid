import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Enhanced Debug API to test button actions with detailed logging
export async function POST(request: Request) {
  try {
    const { action, postId, requestId } = await request.json();
    
    console.log(`🧪 Enhanced Debug: Testing button action: ${action}`, { postId, requestId });

    let result: any = { success: false, message: 'Unknown action' };

    switch (action) {
      case 'approve':
        // Test approve functionality
        if (postId) {
          console.log(`🔍 Approve: Updating payments table for post ${postId}`);
          // Update payments table status
          const { error: paymentError } = await supabase
            .from('payments')
            .update({ status: 'approved' })
            .eq('post_id', postId);

          console.log(`🔍 Approve: Payment update result:`, { paymentError });

          if (paymentError) {
            result = { success: false, message: `Payment approve failed: ${paymentError.message}` };
            break;
          }

          console.log(`🔍 Approve: Updating posts table for post ${postId}`);
          // Also update posts table status to make it visible on homepage
          const { error: postError } = await supabase
            .from('posts')
            .update({ status: 'approved' })
            .eq('id', postId);

          console.log(`🔍 Approve: Post update result:`, { postError });

          if (postError) {
            result = { success: false, message: `Post approve failed: ${postError.message}` };
            break;
          }

          result = { success: true, message: 'Post approved successfully and visible on homepage' };
        }
        break;

      case 'hide':
        // Test hide functionality
        if (postId) {
          console.log(`🔍 Hide: Updating payments table for post ${postId}`);
          // Update payments table status
          const { error: paymentError } = await supabase
            .from('payments')
            .update({ status: 'hidden' })
            .eq('post_id', postId);

          console.log(`🔍 Hide: Payment update result:`, { paymentError });

          if (paymentError) {
            result = { success: false, message: `Payment hide failed: ${paymentError.message}` };
            break;
          }

          console.log(`🔍 Hide: Updating posts table for post ${postId}`);
          // Also update posts table status to hide from homepage
          const { error: postError } = await supabase
            .from('posts')
            .update({ status: 'hidden' })
            .eq('id', postId);

          console.log(`🔍 Hide: Post update result:`, { postError });

          if (postError) {
            result = { success: false, message: `Post hide failed: ${postError.message}` };
            break;
          }

          result = { success: true, message: 'Post hidden successfully and removed from homepage' };
        }
        break;

      case 'delete':
        // Test delete functionality (simulate only)
        if (postId) {
          console.log(`🔍 Delete: Checking post existence for ${postId}`);
          const { data, error } = await supabase
            .from('posts')
            .select('id')
            .eq('id', postId);

          console.log(`🔍 Delete: Post check result:`, { data, error });

          if (error) {
            result = { success: false, message: `Delete check failed: ${error.message}` };
          } else {
            result = { 
              success: true, 
              message: `Delete would remove post and related data. Found ${data?.length || 0} posts.` 
            };
          }
        }
        break;

      case 'edit':
        // Test edit functionality (check if post exists)
        if (postId) {
          console.log(`🔍 Edit: Checking post data for ${postId}`);
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

          console.log(`🔍 Edit: Post data result:`, { data, error });

          if (error) {
            result = { success: false, message: `Edit check failed: ${error.message}` };
          } else {
            result = { 
              success: true, 
              message: 'Post data available for editing',
              data: {
                post: {
                  id: data.id,
                  work: data.work,
                  place: data.place,
                  salary: data.salary,
                  contact: data.contact
                }
              }
            };
          }
        }
        break;

      case 'show':
        // Test show functionality (unhide)
        if (postId) {
          console.log(`🔍 Show: Updating payments table for post ${postId}`);
          // Update payments table status
          const { error: paymentError } = await supabase
            .from('payments')
            .update({ status: 'approved' })
            .eq('post_id', postId);

          console.log(`🔍 Show: Payment update result:`, { paymentError });

          if (paymentError) {
            result = { success: false, message: `Payment show failed: ${paymentError.message}` };
            break;
          }

          console.log(`🔍 Show: Updating posts table for post ${postId}`);
          // Also update posts table status to show on homepage
          const { error: postError } = await supabase
            .from('posts')
            .update({ status: 'approved' })
            .eq('id', postId);

          console.log(`🔍 Show: Post update result:`, { postError });

          if (postError) {
            result = { success: false, message: `Post show failed: ${postError.message}` };
            break;
          }

          result = { success: true, message: 'Post shown successfully and visible on homepage' };
        }
        break;

      default:
        result = { success: false, message: 'Invalid action' };
    }

    console.log(`✅ Enhanced Debug: Action result:`, result);

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced Debug button action error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Debug failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
