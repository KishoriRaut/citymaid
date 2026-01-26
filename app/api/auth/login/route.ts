import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // For demo purposes, accept common admin credentials
    const adminCredentials = [
      { email: "admin@citymaid.com", password: "admin123" },
      { email: "admin", password: "admin" },
      { email: "test@test.com", password: "test123" }
    ];
    
    const isAdmin = adminCredentials.some(cred => cred.email === email && cred.password === password);
    
    if (isAdmin) {
      // Create a mock admin user object
      const user = {
        id: "admin-123",
        email: "admin@citymaid.com",
        name: "Admin User",
        role: "admin"
      };

      return NextResponse.json({
        success: true,
        user: user,
        message: "Login successful"
      });
    }

    // Try Supabase auth (for real users)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: "Login successful"
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
