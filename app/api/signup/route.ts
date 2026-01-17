import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Create user in database
    const { user, error } = await createUser(email, password);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Log successful signup
    console.log("=== SIGNUP SUCCESS ===");
    console.log("User ID:", user?.id);
    console.log("Email:", email);
    console.log("Timestamp:", new Date().toISOString());
    console.log("=====================");

    // Return success response (without password)
    return NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: user?.id,
          email: user?.email,
          created_at: user?.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
