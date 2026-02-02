import { NextRequest, NextResponse } from 'next/server';

// Full contact form API - saves data to database
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Contact API called');
    
    // Parse request body
    const body = await request.json();
    console.log('📝 Form data received:', { ...body, message: body.message?.substring(0, 50) + '...' });
    
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      console.log('❌ Validation failed: missing fields');
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Validation failed: invalid email');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get visitor information
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const referrer = request.headers.get('referer') || '';

    // Insert into database
    console.log('💾 Saving to database...');
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        source: 'website',
        visitor_id: Math.random().toString(36).substring(2, 15),
        user_agent: userAgent,
        ip_address: ipAddress,
        referrer: referrer,
        priority: 'normal'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Successfully saved submission:', data?.id);
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId: data?.id
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('🚀 Contact API GET called');
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return NextResponse.json({
      message: 'Contact API is working',
      timestamp: new Date().toISOString(),
      env: {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey
      },
      database: 'Ready to save submissions'
    });
    
  } catch (error) {
    console.error('❌ GET API error:', error);
    return NextResponse.json(
      { error: 'API error' },
      { status: 500 }
    );
  }
}
