'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'
import { isUserAdminClient } from '@/lib/auth/admin-client'
import { Button } from '@/components/ui/button'

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        console.log('AdminButton: Starting admin check...')
        
        // First check client-side (localStorage)
        const clientIsAdmin = isUserAdminClient()
        console.log('AdminButton: Client-side admin check:', clientIsAdmin)
        
        if (clientIsAdmin) {
          setIsAdmin(true)
          console.log('AdminButton: Admin access via localStorage')
        } else {
          // Try Supabase as fallback
          if (supabaseClient) {
            const { data: { user }, error } = await supabaseClient.auth.getUser()
            console.log('AdminButton: Supabase user data:', { user: user?.email || 'none', error })
            
            if (user?.email === 'kishorirut369@gmail.com') {
              setIsAdmin(true)
              console.log('AdminButton: Admin access via Supabase')
            } else {
              console.log('AdminButton: No admin access found')
            }
          } else {
            console.log('AdminButton: No authentication method available')
          }
        }
      } catch (error) {
        console.error('AdminButton: Admin check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [])

  if (isLoading || !isAdmin) return null

  return (
    <Button
      onClick={() => router.push('/admin')}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
    >
      Admin
    </Button>
  )
}
