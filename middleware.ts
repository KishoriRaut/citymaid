import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to protect /admin routes
 * Checks for user session cookie
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (excluding /admin/login if it exists)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // Check for user session cookie
    const userCookie = request.cookies.get("user_session");
    
    if (!userCookie?.value) {
      // Redirect to login if no session cookie
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Validate cookie contains valid JSON
    try {
      JSON.parse(userCookie.value);
    } catch {
      // Invalid cookie, redirect to login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
