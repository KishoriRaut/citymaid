import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedPaymentRequests } from '@/lib/unified-payment-requests';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 UNIFIED API - Fetching payment requests...');
    
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    const type = searchParams.get('type');
    const visitorId = searchParams.get('visitor_id');
    
    console.log('🔧 UNIFIED API - Query params:', { postId, type, visitorId });

    // Get payment requests with filters
    const result = await getUnifiedPaymentRequests({
      post_id: postId || undefined,
      type: type as 'post_promotion' | 'contact_unlock' | undefined,
      visitor_id: visitorId || undefined
    });

    if (!result.success) {
      console.error('❌ UNIFIED API - Error fetching requests:', result.error);
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 500 }
      );
    }

    console.log('✅ UNIFIED API - Successfully fetched requests:', result.requests?.length);
    return NextResponse.json({
      success: true,
      requests: result.requests,
      total: result.requests?.length || 0
    });

  } catch (error) {
    console.error('❌ UNIFIED API - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
