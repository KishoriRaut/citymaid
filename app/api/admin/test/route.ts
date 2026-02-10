import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪 Test API: Working')
  return NextResponse.json({ message: 'Test API working', timestamp: new Date().toISOString() })
}
