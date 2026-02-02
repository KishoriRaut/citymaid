import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const requestId = params.requestId;
    const { delivery_status, delivery_notes } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Validate delivery status
    const validStatuses = ['pending', 'sent', 'failed', 'manual'];
    if (delivery_status && !validStatuses.includes(delivery_status)) {
      return NextResponse.json(
        { error: 'Invalid delivery status' },
        { status: 400 }
      );
    }

    // Update the contact unlock request
    const updateData: any = {};
    if (delivery_status) updateData.delivery_status = delivery_status;
    if (delivery_notes) updateData.delivery_notes = delivery_notes;

    const { error } = await supabase
      .from('contact_unlock_requests')
      .update(updateData)
      .eq('id', requestId);

    if (error) {
      console.error('Error updating delivery status:', error);
      return NextResponse.json(
        { error: 'Failed to update delivery status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Delivery status updated successfully'
    });

  } catch (error) {
    console.error('Error in delivery status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
