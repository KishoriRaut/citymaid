'use server'

import { supabaseClientServer } from '@/lib/supabase-client-server'
import { cookies } from 'next/headers'

// List of admin emails
const ADMIN_EMAILS = [
  'kishorirut369@gmail.com',
  // Add more admin emails here
]

// Check if user is admin via localStorage (client-side)
export async function isUserAdminFromRequest(request?: Request) {
  try {
    // First try Supabase auth
    const { data: { user } } = await supabaseClientServer.auth.getUser()
    if (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return true
    }
  } catch (error) {
    console.log('Supabase auth check failed, trying fallback...')
  }

  // Fallback: Check if we have a user session from the legacy system
  if (request) {
    const userCookie = request.headers.get('cookie')?.split(';').find(c => c.trim().startsWith('user_session='))
    if (userCookie) {
      try {
        const userSession = decodeURIComponent(userCookie.split('=')[1])
        const user = JSON.parse(userSession)
        return user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
      } catch (error) {
        console.log('Failed to parse user session cookie')
      }
    }
  }

  return false
}

export async function requireAdmin(request?: Request) {
  const isAdmin = await isUserAdminFromRequest(request)
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }
}
