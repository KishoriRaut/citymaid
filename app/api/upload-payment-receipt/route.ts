import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateReceiptFile } from '@/lib/storage';

// Use service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!);

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API: Starting upload process');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('Upload API: File received:', file?.name || 'null');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = validateReceiptFile(file);
    console.log('Upload API: File validation:', validation);
    
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    console.log('Upload API: Generated filename:', fileName);
    console.log('Upload API: Supabase URL:', supabaseUrl);
    console.log('Upload API: Service role exists:', !!serviceRoleKey);

    // Upload using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from('payment-proofs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 });
  }
}
