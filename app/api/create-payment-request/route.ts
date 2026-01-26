import { NextRequest, NextResponse } from 'next/server';
import { createUnifiedPaymentRequest } from '@/lib/unified-payment-requests';
import { PaymentType } from '@/lib/unified-payments';

export async function POST(request: NextRequest) {
  try {
    const { type, postId, userId, visitorId } = await request.json();
    
    console.log('🔧 API - Received payment request:', { type, postId, userId, visitorId });

    // Validate inputs
    if (!type || !postId) {
      console.error('❌ API - Missing required fields:', { type, postId });
      return NextResponse.json(
        { error: 'Missing required fields: type and postId are required' },
        { status: 400 }
      );
    }

    console.log('🔧 API - Calling createUnifiedPaymentRequest...');
    
    // Call the server function
    const result = await createUnifiedPaymentRequest(
      type as PaymentType,
      postId,
      userId,
      visitorId
    );

    console.log('🔧 API - Result from createUnifiedPaymentRequest:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ API - Error in create-payment-request API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
