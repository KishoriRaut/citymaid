import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Testing contact unlock request creation...');
    
    const requestData = {
      post_id: '5595c31e-622b-47a8-b49d-ac52003667cc',
      status: 'pending' as const,
      visitor_id: '8b390f9b-95d2-451a-9569-1d30b4daad35'
    };

    console.log('🔧 TEST - Inserting data:', requestData);

    const { data, error } = await supabase
      .from('contact_unlock_requests')
      .insert(requestData)
      .select()
      .single();

    if (error) {
      console.error('❌ TEST - Error creating unlock request:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      });
    }

    console.log('✅ TEST - Success:', data);
    
    return NextResponse.json({ 
      success: true, 
      data: data
    });
  } catch (error) {
    console.error('❌ TEST - Test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
