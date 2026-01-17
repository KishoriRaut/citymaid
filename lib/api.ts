/**
 * API utility functions with timeout and error handling
 */

import { appConfig } from "./config";

const DEFAULT_TIMEOUT = appConfig.api.timeout;

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fetch with timeout support
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout. Please try again.");
    }
    throw error;
  }
}

/**
 * Parse JSON response with error handling
 */
export async function parseJSONResponse<T>(
  response: Response
): Promise<T> {
  try {
    const text = await response.text();
    if (!text) {
      throw new Error("Empty response");
    }
    return JSON.parse(text) as T;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to parse JSON response:", error);
    }
    throw new Error("Invalid response format");
  }
}

/**
 * Handle API errors consistently
 */
export function handleAPIError(error: unknown): string {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("timeout")) {
      return "Request timed out. Please check your connection and try again.";
    }
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return "Network error. Please check your internet connection.";
    }
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}
