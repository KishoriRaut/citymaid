// Client-side admin authentication utilities

// List of admin emails (must match server-side list)
const ADMIN_EMAILS = [
  'kishoriraut369@gmail.com',
  // Add more admin emails here
]

// Client-side admin check
export function isUserAdminClient() {
  if (typeof window === 'undefined') return false
  
  try {
    // Check localStorage first
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
    }
  } catch (error) {
    console.log('Failed to check localStorage')
  }
  
  return false
}

// Get current user from localStorage
export function getCurrentUser() {
  if (typeof window === 'undefined') return null
  
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      return JSON.parse(userStr)
    }
  } catch (error) {
    console.log('Failed to get current user from localStorage')
  }
  
  return null
}
