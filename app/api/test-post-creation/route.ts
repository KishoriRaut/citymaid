import { NextResponse } from 'next/server';
import { createPaymentRequestAPI } from '@/lib/unified-payments-client';
import { getOrCreateVisitorId } from '@/lib/visitor-id';

export async function GET() {
  try {
    // Test creating a post promotion payment request
    const visitorId = getOrCreateVisitorId();
    const testPostId = 'a4ac3da9-4064-4f47-8e32-3f81e3cd9a17'; // Use existing post ID
    
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
