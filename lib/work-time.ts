/**
 * Work Time / Schedule Configuration
 * 
 * Centralized, industry-ready configuration for work schedules across all job types.
 * Supports multiple schedule types: employment type, shift-based, flexible, and custom.
 * 
 * Structure:
 * - Schedule categories group related time options
 * - Each category has a label and array of time options
 * - "Other" category allows custom schedule input
 * - Backward compatible with existing stored values
 */

export const TIME_CATEGORIES = {
  employment_type: {
    label: "Employment Type",
    types: [
      "Full Time",
      "Part Time",
      "Contract",
      "Temporary",
      "Project Based",
    ],
  },
  shift_based: {
    label: "Shift Based",
    types: [
      "Morning Shift",
      "Day Shift (9–5)",
      "Evening Shift",
      "Night Shift",
      "Rotational Shift",
    ],
  },
  flexible: {
    label: "Flexible",
    types: [
      "Flexible Hours",
      "On Call",
    ],
  },
  legacy: {
    label: "Legacy Options",
    types: [
      "Morning",
      "Day (9–5)",
      "Evening",
      "Night",
    ],
  },
  other: {
    label: "Other",
    types: ["Other"],
  },
} as const;

/**
 * Get all time options as a flat array
 * Useful for dropdowns and filters that need a simple list
 */
export function getAllTimeOptions(): string[] {
  return Object.values(TIME_CATEGORIES).flatMap((category) => category.types);
}

/**
 * Get grouped time options by schedule category
 * Returns array of { label, types } for optgroup usage
 */
export function getGroupedTimeOptions(): Array<{ label: string; types: string[] }> {
  return Object.values(TIME_CATEGORIES).map((category) => ({
    label: category.label,
    types: category.types,
  }));
}

/**
 * Get time options for dropdowns
 * Returns array of { value, label } pairs
 */
export function getTimeOptions(): Array<{ value: string; label: string }> {
  return getAllTimeOptions().map((time) => ({
    value: time,
    label: time,
  }));
}

/**
 * Check if a time option is "Other" (requires custom input)
 */
export function isOtherTimeOption(timeOption: string): boolean {
  return timeOption === "Other";
}
