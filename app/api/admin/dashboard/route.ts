import { NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api/admin'
import { supabaseClientServer } from '@/lib/supabase-client-server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    return withAdminAuth(async (request: Request) => {
    
    console.log('Dashboard API: Fetching stats...')
    
    // Get dashboard stats
    const [
      postsResult,
      paymentsResult
    ] = await Promise.all([
      supabaseClientServer.from('posts').select('count', { count: 'exact' }),
      supabaseClientServer.from('payments').select('count', { count: 'exact' })
    ])

    console.log('Dashboard API: Stats fetched:', {
      posts: postsResult.count,
      payments: paymentsResult.count
    })

    return NextResponse.json({
      stats: {
        totalPosts: postsResult.count || 0,
        totalUsers: 0, // Profiles table doesn't exist yet
        totalPayments: paymentsResult.count || 0
      }
    })
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
