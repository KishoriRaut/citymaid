import { NextRequest, NextResponse } from "next/server";
import { updateUserProfile } from "@/lib/db";
import { isValidEmail } from "@/lib/validation";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    // Update user profile
    const { user, error } = await updateUserProfile(userId, { email });

    if (error || !user) {
      return NextResponse.json(
        { error: error || "Failed to update profile" },
        { status: 400 }
      );
    }

    // Return updated user data without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Profile update error:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
