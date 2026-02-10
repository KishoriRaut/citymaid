'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'

// Admin email addresses (move to environment variables in production)
const ADMIN_EMAILS = new Set([
  'kishoriraut369@gmail.com',
  // Add other admin emails here
])

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Check if we have a Supabase client
        if (!supabaseClient) {
          console.warn('Supabase client not available')
          setIsLoading(false)
          return
        }

        // Get the current user
        const { data: { user }, error } = await supabaseClient.auth.getUser()
        
        if (error && error.message !== 'Auth session missing!') {
          console.error('Error getting user:', error.message)
          setIsLoading(false)
          return
        }

        // Check if user is admin
        if (user?.email && ADMIN_EMAILS.has(user.email)) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        if (error.message !== 'Auth session missing!') {
          console.error('Admin check failed:', error)
        }
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
