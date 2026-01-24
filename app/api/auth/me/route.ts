import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const sessionCookie = request.cookies.get("user_session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "No session found" },
        { status: 401 }
      );
    }

    // Parse session to get user info
    let sessionUser;
    try {
      sessionUser = JSON.parse(sessionCookie);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid session format" },
        { status: 401 }
      );
    }

    if (!sessionUser || !sessionUser.id) {
      return NextResponse.json(
        { error: "Invalid session data" },
        { status: 401 }
      );
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Fetch fresh user data from database
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, role, created_at")
      .eq("id", sessionUser.id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user data with admin status
    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      isAdmin: user.role === 'admin'
    });

  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
