import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/db";

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

    // Verify user credentials
    const { user, error } = await verifyUser(email, password);

    if (error || !user) {
      return NextResponse.json({ error: error || "Invalid credentials" }, { status: 401 });
    }

    // Log successful signin
    console.log("=== SIGNIN SUCCESS ===");
    console.log("User ID:", user.id);
    console.log("Email:", email);
    console.log("Timestamp:", new Date().toISOString());
    console.log("=====================");

    // Return success response (without password)
    return NextResponse.json(
      {
        message: "Signin successful",
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
