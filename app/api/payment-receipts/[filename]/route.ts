import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    console.log('🔍 API - Requested filename:', filename);
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔍 API - Supabase URL exists:', !!supabaseUrl);
    console.log('🔍 API - Service key exists:', !!supabaseKey);
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log('🔍 API - Attempting to download from bucket: payment-receipts');
    
    // Download the file from Supabase storage
    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .download(filename);

    console.log('🔍 API - Download result:', { data: !!data, error: error?.message });

    if (error) {
      console.error('❌ API - Error downloading file:', error);
      return NextResponse.json(
        { error: `File not found: ${error.message}` },
        { status: 404 }
      );
    }

    if (!data) {
      console.error('❌ API - No data returned');
      return NextResponse.json(
        { error: 'File not found: No data returned' },
        { status: 404 }
      );
    }

    // Get file type from the data or default to image/jpeg
    const contentType = filename.toLowerCase().endsWith('.pdf') 
      ? 'application/pdf' 
      : 'image/jpeg';

    console.log('✅ API - Serving file:', filename, 'Type:', contentType);

    // Return the file with appropriate headers
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `inline; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('❌ API - Error serving file:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
