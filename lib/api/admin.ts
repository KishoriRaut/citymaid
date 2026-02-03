import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'

export async function withAdminAuth(handler: (request: Request) => Promise<NextResponse>) {
  return async (request: Request) => {
    try {
      await requireAdmin(request)
      return await handler(request)
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
  }
}

// Example usage:
/*
export async function GET(request: Request) {
  return withAdminAuth(async (request: Request) => {
    // Your admin-only logic here
    return NextResponse.json({ data: 'Admin data' })
  })
}
*/
