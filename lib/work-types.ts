/**
 * Work Types Configuration
 * 
 * Centralized, industry-ready configuration for work types across the marketplace.
 * Supports multiple industries: domestic, hospitality, construction, transport,
 * security, office, IT, manufacturing, and more.
 * 
 * Structure:
 * - Industries group related work types
 * - Each industry has a label and array of job types
 * - "Other" category allows custom work type input
 * - Backward compatible with existing posts
 */

export const WORK_CATEGORIES = {
  domestic_care: {
    label: "Domestic & Care",
    types: [
      "Cooking",
      "Cleaning",
      "Cooking + Cleaning",
      "Babysitting",
      "Elder Care",
    ],
  },
  hospitality_services: {
    label: "Hospitality & Services",
    types: [
      "Hotel Staff",
      "Restaurant Helper",
      "Cook (Commercial)",
      "Housekeeping",
      "Catering Staff",
    ],
  },
  construction_labor: {
    label: "Construction & Labor",
    types: [
      "Construction Worker",
      "Mason",
      "Painter",
      "Plumber",
      "Electrician",
      "General Labor",
    ],
  },
  transport_logistics: {
    label: "Transport & Logistics",
    types: [
      "Driver",
      "Delivery Person",
      "Warehouse Helper",
    ],
  },
  security: {
    label: "Security",
    types: [
      "Security Guard",
      "Watchman",
    ],
  },
  office_admin: {
    label: "Office & Admin",
    types: [
      "Office Assistant",
      "Data Entry",
      "Receptionist",
      "Clerk",
    ],
  },
  it_digital: {
    label: "IT & Digital",
    types: [
      "Computer Operator",
      "IT Support",
      "Graphic Designer",
      "Web Assistant",
    ],
  },
  manufacturing_factory: {
    label: "Manufacturing & Factory",
    types: [
      "Factory Worker",
      "Machine Operator",
      "Packaging Staff",
    ],
  },
  other: {
    label: "Other",
    types: ["Other"],
  },
} as const;

/**
 * Get all work types as a flat array
 * Useful for dropdowns and filters that need a simple list
 */
export function getAllWorkTypes(): string[] {
  return Object.values(WORK_CATEGORIES).flatMap((category) => category.types);
}

/**
 * Get grouped work types by industry
 * Returns array of { label, types } for optgroup usage
 */
export function getGroupedWorkTypes(): Array<{ label: string; types: string[] }> {
  return Object.values(WORK_CATEGORIES).map((category) => ({
    label: category.label,
    types: [...category.types],
  }));
}

/**
 * Get work type options for dropdowns
 * Returns array of { value, label } pairs
 */
export function getWorkTypeOptions(): Array<{ value: string; label: string }> {
  return getAllWorkTypes().map((type) => ({
    value: type,
    label: type,
  }));
}

/**
 * Check if a work type is "Other" (requires custom input)
 */
export function isOtherWorkType(workType: string): boolean {
  return workType === "Other";
}
