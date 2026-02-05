import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api/admin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/contact-unlock-requests - Get all contact unlock requests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query = supabase
      .from('contact_unlock_requests')
      .select(`
        *,
        posts (
          work,
          place,
          salary,
          contact
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contact unlock requests:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ requests: data || [] });
  } catch (error) {
    console.error('Error in GET contact unlock requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/contact-unlock-requests/[requestId] - Delete a specific contact unlock request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    return withAdminAuth(async (request: Request) => {
      const { requestId } = params;

      if (!requestId) {
        return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
      }

      console.log(`🗑️ Deleting contact unlock request: ${requestId}`);

      const { error } = await supabase
        .from('contact_unlock_requests')
        .delete()
        .eq('id', requestId);

      if (error) {
        console.error('Error deleting contact unlock request:', error);
        return NextResponse.json({ error: 'Failed to delete contact unlock request' }, { status: 500 });
      }

      console.log(`✅ Successfully deleted contact unlock request: ${requestId}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Contact unlock request deleted successfully' 
      });
    });
  } catch (error) {
    console.error('Delete contact unlock request error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete contact unlock request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
