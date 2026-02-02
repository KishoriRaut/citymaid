import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get visitor information
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const referrer = request.headers.get('referer') || '';

    // Generate visitor ID (simple approach - in production, use proper session management)
    const visitorId = Math.random().toString(36).substring(2, 15);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try to insert using the function first, fallback to direct insert
    let data, error;
    
    try {
      const result = await supabase.rpc('insert_contact_submission', {
        p_name: name.trim(),
        p_email: email.trim().toLowerCase(),
        p_message: message.trim(),
        p_source: 'website',
        p_visitor_id: visitorId,
        p_user_agent: userAgent,
        p_ip_address: ipAddress,
        p_referrer: referrer
      });
      
      data = result.data;
      error = result.error;
    } catch (rpcError) {
      // Fallback to direct insert if function doesn't exist
      console.log('RPC function not found, using direct insert');
      const result = await supabase
        .from('contact_submissions')
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          message: message.trim(),
          source: 'website',
          visitor_id: visitorId,
          user_agent: userAgent,
          ip_address: ipAddress,
          referrer: referrer,
          priority: 'normal'
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error inserting contact submission:', error);
      return NextResponse.json(
        { error: 'Failed to submit contact form. Please try again.' },
        { status: 500 }
      );
    }

    // Send notification email (you would implement this with your email service)
    // await sendNotificationEmail(data[0]);

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId: data[0]?.id
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for admin to retrieve submissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || null;
    const priority = searchParams.get('priority') || null;
    const search = searchParams.get('search') || null;

    // Create Supabase client with service role key for admin access
    const supabase = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
    );

    let data, error;

    try {
      // Try to use the function first
      const result = await supabase.rpc('get_contact_submissions', {
        p_page: page,
        p_limit: limit,
        p_status: status,
        p_priority: priority,
        p_search: search
      });
      
      data = result.data;
      error = result.error;
    } catch (rpcError) {
      // Fallback to direct query if function doesn't exist
      console.log('RPC function not found, using direct query');
      
      let query = supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (priority) {
        query = query.eq('priority', priority);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`);
      }

      // Apply pagination
      const fromRow = (page - 1) * limit;
      const toRow = fromRow + limit - 1;
      
      const result = await query.range(fromRow, toRow);
      
      data = result.data;
      error = result.error;
      
      // Add total_count for compatibility
      if (data && !error) {
        data = data.map(item => ({
          ...item,
          total_count: result.count || 0
        }));
      }
    }

    if (error) {
      console.error('Error fetching contact submissions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissions: data,
      pagination: {
        page,
        limit,
        total: data[0]?.total_count || 0
      }
    });

  } catch (error) {
    console.error('Fetch contact submissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
