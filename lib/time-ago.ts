/**
 * Time formatting utilities for relative time display
 * Following industry best practices for job boards and social platforms
 */

/**
 * Format a timestamp as relative time (e.g., "2 hours ago", "3 days ago")
 * @param timestamp - ISO string or Date object
 * @returns Formatted relative time string
 */
export function formatTimeAgo(timestamp: string | Date): string {
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  // Calculate difference in seconds
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Handle future dates (shouldn't happen but just in case)
  if (diffInSeconds < 0) {
    return 'just now';
  }
  
  // Less than 1 minute
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  // Less than 1 hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  
  // Less than 1 day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  
  // Less than 1 week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  
  // Less than 1 month
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  
  // Less than 1 year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  
  // More than 1 year
  const years = Math.floor(diffInSeconds / 31536000);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

/**
 * Format a timestamp with both relative time and exact date
 * Shows relative time with exact date in title for hover/tooltip
 * @param timestamp - ISO string or Date object
 * @returns Object with relative and absolute time strings
 */
export function formatTimeWithDetails(timestamp: string | Date): {
  relative: string;
  absolute: string;
  title: string;
} {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const relative = formatTimeAgo(timestamp);
  
  // Format absolute date consistently
  const absolute = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Title attribute for hover
  const title = `Posted on ${date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`;
  
  return { relative, absolute, title };
}

/**
 * Check if a post is considered "fresh" (posted within last 3 days)
 * @param timestamp - ISO string or Date object
 * @returns boolean indicating if post is fresh
 */
export function isFreshPost(timestamp: string | Date): boolean {
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays <= 3;
}

/**
 * Check if a post is considered "old" (posted more than 30 days ago)
 * @param timestamp - ISO string or Date object
 * @returns boolean indicating if post is old
 */
export function isOldPost(timestamp: string | Date): boolean {
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays > 30;
}
