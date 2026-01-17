import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, findUserById } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get user email or userId from query parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    let user;
    let error;

    // Prefer userId if provided, otherwise use email
    if (userId) {
      const result = await findUserById(userId);
      user = result.user;
      error = result.error;
    } else if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      // Find user in database
      const result = await findUserByEmail(email);
      user = result.user;
      error = result.error;
    } else {
      return NextResponse.json(
        { error: "Email or userId is required" },
        { status: 400 }
      );
    }

    if (error || !user) {
      return NextResponse.json(
        { error: error || "User not found" },
        { status: 404 }
      );
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      {
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
