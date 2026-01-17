import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/db";
import { isValidEmail, isValidPassword } from "@/lib/validation";

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
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Create user in database
    const { user, error } = await createUser(email, password);

    if (error) {
      return NextResponse.json(
        { error: error || "Failed to create user" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

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
    if (process.env.NODE_ENV === "development") {
      console.error("Signup error:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
