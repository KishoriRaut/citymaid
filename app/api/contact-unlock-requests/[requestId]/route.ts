import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  { params }
: { params: { requestId: string } }
) {
  try {
    console.log(`🗑️ Deleting contact unlock request: ${params.requestId}`);

    // Delete the contact unlock request
    const { error } = await supabase
      .from('contact_unlock_requests')
      .delete()
      .eq('id', params.requestId);

    if (error) {
      console.error('❌ Error deleting contact unlock request:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error.message || 'Failed to delete contact unlock request' 
        },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully deleted contact unlock request: ${params.requestId}`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact unlock request deleted successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}
