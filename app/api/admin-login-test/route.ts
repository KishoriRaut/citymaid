import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Simple admin login test API
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 Admin login test:', { email, password });

    // Test admin login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Admin login failed:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'No user found' 
      }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = data.user.email === 'kishoriraut369@gmail.com';
    
    console.log('✅ Login successful:', {
      email: data.user.email,
      isAdmin
    });

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        isAdmin
      }
    });

  } catch (error) {
    console.error('Admin login test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    }, { status: 500 });
  }
}
