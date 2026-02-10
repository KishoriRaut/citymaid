import { NextResponse } from 'next/server'
import { supabaseClientServer } from '@/lib/supabase-client-server'

export async function GET() {
  console.log('🔍 Debug API: Testing connection...')
  console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('🔍 Supabase Key:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...')
  console.log('🔍 Is configured:', supabaseClientServer ? 'YES' : 'NO')
  
  try {
    // Test simple queries without joins
    const { data: posts, error: postsError } = await supabaseClientServer
      .from('posts')
      .select('count', { count: 'exact', head: true })
    
    console.log('🔍 Posts result:', { count: posts, error: postsError?.message })
    
    const { data: payments, error: paymentsError } = await supabaseClientServer
      .from('payments')
      .select('count', { count: 'exact', head: true })
    
    console.log('🔍 Payments result:', { count: payments, error: paymentsError?.message })
    
    // Test with joins - this is where it fails
    console.log('🔍 Testing with joins...')
    const { data: postsWithJoins, error: joinError } = await supabaseClientServer
      .from('posts')
      .select(`
        id,
        work,
        post_type,
        status,
        payments (
          id,
          status,
          amount
        )
      `)
      .limit(3)
    
    console.log('🔍 Posts with joins result:', { dataLength: postsWithJoins?.length, error: joinError?.message })
    
    return NextResponse.json({
      success: true,
      posts: posts,
      payments: payments,
      postsError: postsError?.message,
      paymentsError: paymentsError?.message,
      joinError: joinError?.message,
      postsWithJoins: postsWithJoins?.length
    })
  } catch (error) {
    console.error('🔍 Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
