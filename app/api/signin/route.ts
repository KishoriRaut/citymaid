import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/db";
import { isValidEmail } from "@/lib/validation";

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

    // Verify user credentials
    const { user, error, errorType } = await verifyUser(email, password);

    if (error || !user) {
      return NextResponse.json(
        { 
          error: error || "Invalid credentials",
          errorType: errorType || "general"
        }, 
        { status: 401 }
      );
    }

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
    if (process.env.NODE_ENV === "development") {
      console.error("Signin error:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
