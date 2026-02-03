import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  try {
    const { email } = await request.json()
    
    if (email === 'kishorirut369@gmail.com') {
      // Create a mock user session
      const user = {
        id: 'admin-dev',
        email: 'kishorirut369@gmail.com',
        name: 'Admin User',
        role: 'admin',
        created_at: new Date().toISOString()
      }

      console.log('Dev login: Setting user session for', email)

      // Set the user in a cookie
      const response = NextResponse.json({ success: true, user })
      response.cookies.set('user_session', JSON.stringify(user), {
        httpOnly: true,
        secure: false, // For development
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      })

      return response
    }

    return NextResponse.json({ error: 'Invalid email' }, { status: 401 })
  } catch (error) {
    console.error('Dev login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
