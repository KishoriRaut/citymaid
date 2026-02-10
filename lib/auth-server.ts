import "server-only";
import { cookies } from "next/headers";

/**
 * Server-side authentication utilities
 * Note: Since we're using localStorage (client-side), we need to pass
 * session data via cookies for server-side validation
 */

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

/**
 * Get authenticated user from cookies
 * This requires the client to set a cookie on login
 */
export async function getServerSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user_session");
    
    if (!userCookie?.value) {
      return null;
    }

    try {
      const user = JSON.parse(userCookie.value) as AuthUser;
      return user;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getServerSession();
  return user !== null;
}
