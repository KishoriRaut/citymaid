import { NextRequest, NextResponse } from 'next/server';
import { getUnifiedPaymentRequest } from '@/lib/unified-payment-requests';
import { PaymentType } from '@/lib/unified-payments';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('id');
    const type = searchParams.get('type') as PaymentType;

    if (!requestId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: id and type are required' },
        { status: 400 }
      );
    }

    // Call the server function
    const result = await getUnifiedPaymentRequest(requestId, type);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in get-payment-request API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
