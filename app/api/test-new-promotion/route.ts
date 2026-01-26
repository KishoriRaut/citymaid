import { NextResponse } from 'next/server';
import { createPaymentRequestAPI } from '@/lib/unified-payments-client';
import { getOrCreateVisitorId } from '@/lib/visitor-id';

export async function GET() {
  try {
    // Test creating a post promotion payment request for a non-promoted post
    const visitorId = getOrCreateVisitorId();
    const testPostId = 'e277ce8c-6d66-4ca7-b85a-1d6c9e7fcd91'; // Non-promoted post
    
    const { success, requestId, error } = await createPaymentRequestAPI(
      'post_promotion',
      testPostId,
      null, // No user ID for visitor-based flow
      visitorId
    );

    return NextResponse.json({ 
      success,
      requestId,
      error,
      visitorId,
      testPostId,
      paymentUrl: success ? `/payment/post_promotion-${requestId}` : null
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
