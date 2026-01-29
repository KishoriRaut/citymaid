import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  console.log('🔵 PAYMENTS API - POST request received');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { postId, amount } = body;

    // Basic validation
    if (!postId || amount === undefined) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: postId and amount are required' },
        { status: 400 }
      );
    }

    console.log('Creating payment for post:', { postId, amount });

    // Create payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([{
        post_id: postId,
        amount: Number(amount),
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Payment created successfully:', payment.id);
    return NextResponse.json({ 
      success: true,
      paymentId: payment.id 
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add a simple GET endpoint for testing
export async function GET() {
  console.log('🔵 PAYMENTS API - Test endpoint hit');
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Payments API is working',
    timestamp: new Date().toISOString()
  });
}
