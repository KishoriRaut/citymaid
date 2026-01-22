import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mask contact number (utility function for client and server)
export function maskContact(contact: string): string {
  if (!contact || contact.length < 4) return "****";
  const start = contact.slice(0, 2);
  const end = contact.slice(-2);
  const masked = "*".repeat(Math.max(4, contact.length - 4));
  return `${start}${masked}${end}`;
}
