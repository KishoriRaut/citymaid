import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get a sample row to see the structure
    const { data: sampleRow, error: sampleError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (sampleError) {
      return NextResponse.json({
        success: false,
        error: sampleError.message
      }, { status: 500 });
    }

    // Get column names from the sample row
    const columnNames = sampleRow && sampleRow.length > 0 ? Object.keys(sampleRow[0]) : [];

    return NextResponse.json({
      success: true,
      data: {
        sampleRow: sampleRow || [],
        columnNames: columnNames
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
