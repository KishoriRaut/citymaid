import { NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api/admin'
import { supabaseClientServer } from '@/lib/supabase-client-server'

export async function GET(request: Request) {
  return withAdminAuth(async (request: Request) => {
    try {
      console.log('Dashboard API: Admin authenticated, fetching stats...')
      
      // Get dashboard stats
      const [
        postsResult,
        usersResult,
        paymentsResult
      ] = await Promise.all([
        supabaseClientServer.from('posts').select('count', { count: 'exact' }),
        supabaseClientServer.from('profiles').select('count', { count: 'exact' }),
        supabaseClientServer.from('payments').select('count', { count: 'exact' })
      ])

      console.log('Dashboard API: Stats fetched:', {
        posts: postsResult.count,
        users: usersResult.count,
        payments: paymentsResult.count
      })

      return NextResponse.json({
        stats: {
          totalPosts: postsResult.count || 0,
          totalUsers: usersResult.count || 0,
          totalPayments: paymentsResult.count || 0
        }
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
  })
}
