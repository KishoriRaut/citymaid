import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      // Update existing user to admin role
      const { data: updatedUser, error } = await supabase
        .from("users")
        .update({ role: "admin" })
        .eq("email", email)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to update user role: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "User updated to admin role successfully",
        user: updatedUser
      });
    }

    // Create new admin user
    const hashedPassword = await hashPassword(password);

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        password: hashedPassword,
        role: "admin"
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create admin user: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user
    });

  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
