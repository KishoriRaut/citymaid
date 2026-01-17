import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

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
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

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
      console.error("Database error:", error);
      return { user: null, error: "Failed to create user" };
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = data;
    return { user: userWithoutPassword as User, error: null };
  } catch (error) {
    console.error("Create user error:", error);
    return { user: null, error: "Internal server error" };
  }
}

// Find user by email
export async function findUserByEmail(
  email: string
): Promise<{ user: User | null; error: string | null }> {
  try {
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
      console.error("Database error:", error);
      return { user: null, error: "Database error" };
    }

    return { user: data as User, error: null };
  } catch (error) {
    console.error("Find user error:", error);
    return { user: null, error: "Internal server error" };
  }
}

// Verify user credentials
export async function verifyUser(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { user, error: findError } = await findUserByEmail(email);

    if (findError || !user) {
      return { user: null, error: "Invalid email or password" };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return { user: null, error: "Invalid email or password" };
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, error: null };
  } catch (error) {
    console.error("Verify user error:", error);
    return { user: null, error: "Internal server error" };
  }
}
