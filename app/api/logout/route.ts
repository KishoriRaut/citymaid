import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create a response that clears the session cookie
    const response = NextResponse.json({ message: "Logged out successfully" });
    
    // Clear the session cookie
    response.cookies.set("user_session", "", {
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
