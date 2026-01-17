import "server-only";

import { supabase, isSupabaseConfigured } from "./supabase";
import bcrypt from "bcryptjs";
import { isValidEmail } from "./validation";

export interface User {
  id: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Create a new user
export async function createUser(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Supabase not configured. Check .env.local and restart server.");
      }
      return {
        user: null,
        error: "Database is not configured. Please check your .env.local file and restart the dev server.",
      };
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    // If error is not "not found", it's a real error
    if (checkError && checkError.code !== "PGRST116") {
      if (process.env.NODE_ENV === "development") {
        console.error("Error checking existing user:", checkError);
      }
      return {
        user: null,
        error: `Database error: ${checkError.message || "Failed to check user"}`,
      };
    }

    if (existingUser) {
      return { user: null, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const { data, error } = await supabase
      .from("users")
      .insert({
        email,
        password: hashedPassword,
      })
      .select()
      .single();

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Database insert error:", error);
      }
      // Provide more specific error messages
      if (error.code === "42P01") {
        return { 
          user: null, 
          error: "Database table 'users' does not exist. Please run the SQL schema from database/supabase-setup.sql in your Supabase SQL Editor." 
        };
      }
      if (error.code === "23505") {
        return { user: null, error: "User with this email already exists" };
      }
      if (error.code === "PGRST301" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        return { 
          user: null, 
          error: "Database table 'users' does not exist. Please run the SQL schema from database/supabase-setup.sql in your Supabase SQL Editor." 
        };
      }
      return { 
        user: null, 
        error: `Failed to create user: ${error.message || error.code || "Database error"}` 
      };
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = data;
    return { user: userWithoutPassword as User, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Create user error:", error);
    }
    return { user: null, error: "Internal server error" };
  }
}

// Find user by email
export async function findUserByEmail(
  email: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return {
        user: null,
        error: "Database is not configured. Please set up Supabase credentials in .env.local",
      };
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return { user: null, error: "User not found" };
      }
      if (process.env.NODE_ENV === "development") {
        console.error("Database error:", error);
      }
      return { user: null, error: "Database error" };
    }

    return { user: data as User, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Find user error:", error);
    }
    return { user: null, error: "Internal server error" };
  }
}

// Verify user credentials
export async function verifyUser(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null; errorType?: "email" | "password" }> {
  try {
    const { user, error: findError } = await findUserByEmail(email);

    if (findError || !user) {
      // Check if it's a "user not found" error specifically
      if (findError === "User not found") {
        return { user: null, error: "No account found with this email address", errorType: "email" };
      }
      return { user: null, error: findError || "Invalid email or password", errorType: "email" };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return { user: null, error: "Incorrect password", errorType: "password" };
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Verify user error:", error);
    }
    return { user: null, error: "Internal server error" };
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: { email?: string }
): Promise<{ user: User | null; error: string | null }> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return {
        user: null,
        error: "Database is not configured. Please set up Supabase credentials in .env.local",
      };
    }

    // Validate email if provided
    if (updates.email) {
      if (!isValidEmail(updates.email)) {
        return { user: null, error: "Invalid email format" };
      }

      // Check if email is already taken by another user
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", updates.email)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        if (process.env.NODE_ENV === "development") {
          console.error("Error checking existing email:", checkError);
        }
        return { user: null, error: "Database error" };
      }

      if (existingUser && existingUser.id !== userId) {
        return { user: null, error: "Email is already in use by another account" };
      }
    }

    // Build update object
    const updateData: { email?: string } = {};
    if (updates.email) {
      updateData.email = updates.email;
    }

    // Update user
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Database update error:", error);
      }
      return { user: null, error: `Failed to update profile: ${error.message || "Database error"}` };
    }

    if (!data) {
      return { user: null, error: "User not found" };
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = data;
    return { user: userWithoutPassword as User, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Update user profile error:", error);
    }
    return { user: null, error: "Internal server error" };
  }
}

// Find user by ID
export async function findUserById(
  userId: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return {
        user: null,
        error: "Database is not configured. Please set up Supabase credentials in .env.local",
      };
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { user: null, error: "User not found" };
      }
      if (process.env.NODE_ENV === "development") {
        console.error("Database error:", error);
      }
      return { user: null, error: "Database error" };
    }

    return { user: data as User, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Find user by ID error:", error);
    }
    return { user: null, error: "Internal server error" };
  }
}
