import { NextRequest, NextResponse } from 'next/server';
import { createUnifiedPaymentRequest } from '@/lib/unified-payment-requests';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 TEST - Manually creating payment request...');
    
    const { postId } = await request.json();
    
    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    // Generate a test visitor ID
    const generateServerVisitorId = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    const visitorId = generateServerVisitorId();
    
    console.log('🔧 TEST - Creating payment request for:', { postId, visitorId });
    
    const paymentResult = await createUnifiedPaymentRequest(
      "post_promotion", 
      postId,
      undefined, // No user ID for visitors
      visitorId
    );
    
    console.log('🔧 TEST - Payment request result:', paymentResult);
    
    return NextResponse.json({
      success: true,
      paymentResult,
      postId,
      visitorId
    });

  } catch (error) {
    console.error('❌ TEST - Error:', error);
    return NextResponse.json(
      { error: 'Test endpoint failed', details: error },
      { status: 500 }
    );
  }
}
