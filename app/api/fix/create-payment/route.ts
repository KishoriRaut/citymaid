import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 FIX - Manually creating payment record...');
    
    const { postId } = await request.json();
    
    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    // Generate a visitor ID
    const generateServerVisitorId = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    const visitorId = generateServerVisitorId();
    
    console.log('🔧 FIX - Creating payment record for:', { postId, visitorId });
    
    // First, update the post to ensure it has the right status
    const { error: postError } = await supabase
      .from('posts')
      .update({ 
        homepage_payment_status: 'pending'
      })
      .eq('id', postId);

    if (postError) {
      console.error('❌ FIX - Error updating post:', postError);
      return NextResponse.json({ error: 'Failed to update post', details: postError }, { status: 500 });
    }
    
    // Create the payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        post_id: postId,
        visitor_id: visitorId,
        amount: 299,
        method: 'bank_transfer',
        receipt_url: null,
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('❌ FIX - Error creating payment record:', paymentError);
      return NextResponse.json({ error: 'Failed to create payment record', details: paymentError }, { status: 500 });
    }

    console.log('✅ FIX - Payment record created successfully:', paymentData);
    
    return NextResponse.json({
      success: true,
      paymentData,
      postId,
      visitorId
    });

  } catch (error) {
    console.error('❌ FIX - Error:', error);
    return NextResponse.json(
      { error: 'Fix endpoint failed', details: error },
      { status: 500 }
    );
  }
}
