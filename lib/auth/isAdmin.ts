/**
 * Single source of truth for admin authorization
 * Replaces all hardcoded email arrays throughout the codebase
 */

export function isAdminUser(user: { email?: string; role?: string } | null): boolean {
  if (!user) return false;
  return user.role === 'admin';
}
