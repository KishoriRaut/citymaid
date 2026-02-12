import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// List of admin emails
const ADMIN_EMAILS = [
  'kishoriraut369@gmail.com',
  // Add more admin emails here
];

export async function GET() {
  console.log('API check-admin: Starting admin check...')
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('API check-admin: User data:', { user: user?.email || 'none', error })
    
    if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      console.log('API check-admin: Access denied for:', user?.email || 'none')
      console.log('API check-admin: Admin emails:', ADMIN_EMAILS)
      return NextResponse.json({ isAdmin: false }, { status: 403 })
    }
    
    console.log('API check-admin: Access granted for:', user.email)
    return NextResponse.json({ isAdmin: true })
  } catch (error) {
    console.error('API check-admin: Admin check failed:', error)
    return NextResponse.json(
      { error: 'Failed to verify admin status' },
      { status: 500 }
    )
  }
}
