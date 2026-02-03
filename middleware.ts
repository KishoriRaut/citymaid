import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isUserAdminFromRequest } from "@/lib/auth/admin";

/**
 * Middleware to protect /admin routes
 * Checks for authenticated admin user (supports both Supabase and legacy auth)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    console.log('Middleware: Checking admin access for:', pathname);
    
    const isAdmin = await isUserAdminFromRequest(request);
    console.log('Middleware: Admin access result:', isAdmin);
    
    if (!isAdmin) {
      console.log('Middleware: Access denied - user not in admin list');
      
      // Redirect to unauthorized page if not admin
      const unauthorizedUrl = new URL("/unauthorized", request.url);
      console.log('Middleware: Redirecting to:', unauthorizedUrl.toString());
      return NextResponse.redirect(unauthorizedUrl);
    }
    
    console.log('Middleware: Access granted');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
