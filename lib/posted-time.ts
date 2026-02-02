/**
 * Posted Time Filter Configuration
 * 
 * Configuration for filtering posts based on when they were posted
 * This is separate from work schedule time filters
 */

export const POSTED_TIME_OPTIONS = [
  { value: "all", label: "All Time", days: 0 },
  { value: "today", label: "Today", days: 1 },
  { value: "yesterday", label: "Yesterday", days: 2 },
  { value: "3days", label: "Last 3 Days", days: 3 },
  { value: "week", label: "Last Week", days: 7 },
  { value: "2weeks", label: "Last 2 Weeks", days: 14 },
  { value: "month", label: "Last Month", days: 30 },
  { value: "3months", label: "Last 3 Months", days: 90 },
] as const;

/**
 * Get all posted time options for dropdown
 */
export function getPostedTimeOptions(): Array<{ value: string; label: string; days: number }> {
  return POSTED_TIME_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
    days: option.days,
  }));
}

/**
 * Get posted time options as simple array for Select components
 */
export function getPostedTimeLabels(): string[] {
  return POSTED_TIME_OPTIONS.map(option => option.label);
}

/**
 * Get days filter for a given posted time value
 */
export function getPostedTimeDays(value: string): number {
  console.log(`🔍 getPostedTimeDays called with value: ${value}`);
  const option = POSTED_TIME_OPTIONS.find(opt => opt.value === value);
  const days = option ? option.days : 0;
  console.log(`🔍 getPostedTimeDays returning: ${days}`);
  return days;
}

/**
 * Calculate date range for filtering posts
 */
export function getPostedDateRange(days: number): { startDate: Date; endDate: Date } {
  console.log(`🔍 getPostedDateRange called with days: ${days}`);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  console.log(`🔍 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  return { startDate, endDate };
}
