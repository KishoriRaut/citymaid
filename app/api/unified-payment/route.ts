import { NextRequest, NextResponse } from 'next/server';
import { updateUnifiedPayment } from '@/lib/unified-payment-requests';
import { isValidPaymentType, PaymentType } from '@/lib/unified-payments';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 UNIFIED API - Starting unified payment upload...');
    
    const formData = await request.formData();
    const requestId = formData.get('requestId') as string;
    const type = formData.get('type') as string;
    const paymentProofBase64 = formData.get('paymentProofBase64') as string;
    const fileName = formData.get('fileName') as string;
    const fileType = formData.get('fileType') as string;
    const transactionId = formData.get('transactionId') as string;

    console.log('🔧 UNIFIED API - Received data:', { 
      requestId, 
      type,
      fileName, 
      fileType,
      base64Length: paymentProofBase64?.length,
      transactionId 
    });

    // Validate payment type
    if (!isValidPaymentType(type)) {
      console.error('❌ UNIFIED API - Invalid payment type:', type);
      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      );
    }

    if (!requestId || !paymentProofBase64) {
      console.error('❌ UNIFIED API - Missing required fields:', { 
        requestId, 
        hasBase64: !!paymentProofBase64 
      });
      return NextResponse.json(
        { error: 'Missing required fields: requestId and paymentProofBase64 are required' },
        { status: 400 }
      );
    }

    // Extract contact information from form data
    const userName = formData.get('userName') as string;
    const userPhone = formData.get('userPhone') as string;
    const userEmail = formData.get('userEmail') as string;
    const contactPreference = formData.get('contactPreference') as string;

    console.log('🔧 UNIFIED API - Contact info:', { 
      userName, 
      userPhone, 
      userEmail, 
      contactPreference 
    });

    // Call the unified server function
    console.log('🔧 UNIFIED API - Calling updateUnifiedPayment...');
    const result = await updateUnifiedPayment(
      requestId,
      type as PaymentType,
      paymentProofBase64,
      fileName,
      fileType,
      transactionId,
      userName,
      userPhone,
      userEmail,
      contactPreference
    );

    console.log('🔧 UNIFIED API - Result from updateUnifiedPayment:', result);

    if (result.success) {
      console.log('✅ UNIFIED API - Payment proof uploaded successfully');
      return NextResponse.json({ success: true });
    } else {
      console.error('❌ UNIFIED API - Error from updateUnifiedPayment:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to upload payment proof' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ UNIFIED API - Error in unified-payment API:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
