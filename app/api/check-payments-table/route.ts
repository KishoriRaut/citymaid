import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if payments table exists and get its structure
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        details: error,
        tableExists: false
      });
    }

    return NextResponse.json({ 
      tableExists: true,
      sampleData: data,
      count: data?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
