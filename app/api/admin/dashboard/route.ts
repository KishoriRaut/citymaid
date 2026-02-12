import { NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api/admin'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    return withAdminAuth(async (request: Request) => {
      console.log('🔍 Dashboard API: Starting fetch...');
      console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('🔍 Supabase Key:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...');
      
      // Test basic connection first
      try {
        const { data: testData, error: testError } = await supabase.from('posts').select('count', { count: 'exact', head: true });
        console.log('🔍 Test connection result:', { testData, testError: testError?.message });
      } catch (testErr) {
        console.log('🔍 Test connection error:', testErr);
      }
      
      console.log('Dashboard API: Fetching stats...');
      
      // Get dashboard stats with working joins
      const [
        postsResult,
        paymentsResult
      ] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('id', { count: 'exact', head: true })
      ]);

      console.log('Dashboard API: Stats fetched:', {
        posts: postsResult.count,
        payments: paymentsResult.count,
        postsError: postsResult.error?.message,
        paymentsError: paymentsResult.error?.message
      });

      const response = NextResponse.json({
        stats: {
          totalPosts: postsResult.count || 0,
          totalUsers: 0, // Profiles table doesn't exist yet
          totalPayments: paymentsResult.count || 0
        }
      });
      
      return response;
    })
  } catch (error) {
    console.error('Dashboard API error details:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
