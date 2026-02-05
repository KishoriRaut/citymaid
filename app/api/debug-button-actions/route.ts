import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Debug API to test button actions
export async function POST(request: Request) {
  try {
    const { action, postId, requestId } = await request.json();
    
    console.log(`🧪 Testing button action: ${action}`, { postId, requestId });

    let result: any = { success: false, message: 'Unknown action' };

    switch (action) {
      case 'approve':
        // Test approve functionality
        if (postId) {
          const { error } = await supabase
            .from('payments')
            .update({ status: 'approved' })
            .eq('post_id', postId);

          if (error) {
            result = { success: false, message: `Approve failed: ${error.message}` };
          } else {
            result = { success: true, message: 'Post approved successfully' };
            // Reset back to pending
            await supabase
              .from('payments')
              .update({ status: 'pending' })
              .eq('post_id', postId);
          }
        }
        break;

      case 'hide':
        // Test hide functionality
        if (postId) {
          const { error } = await supabase
            .from('payments')
            .update({ status: 'hidden' })
            .eq('post_id', postId);

          if (error) {
            result = { success: false, message: `Hide failed: ${error.message}` };
          } else {
            result = { success: true, message: 'Post hidden successfully' };
            // Reset back to pending
            await supabase
              .from('payments')
              .update({ status: 'pending' })
              .eq('post_id', postId);
          }
        }
        break;

      case 'delete':
        // Test delete functionality (simulate only)
        if (postId) {
          const { data, error } = await supabase
            .from('payments')
            .select('id')
            .eq('post_id', postId);

          if (error) {
            result = { success: false, message: `Delete check failed: ${error.message}` };
          } else {
            result = { 
              success: true, 
              message: `Delete would remove post and ${data?.length || 0} related payments` 
            };
          }
        }
        break;

      case 'edit':
        // Test edit functionality (check if post exists)
        if (postId) {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

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

      default:
        result = { success: false, message: 'Invalid action' };
    }

    console.log(`✅ Action result:`, result);

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug button action error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Debug failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
