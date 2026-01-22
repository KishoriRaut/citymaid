"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";

const WORK_OPTIONS = [
  "All Work Types",
  "Cooking",
  "Cleaning",
  "Cooking + Cleaning",
  "Babysitting",
  "Elder Care",
  "Other",
];

const TIME_OPTIONS = [
  "All Times",
  "Morning",
  "Day (9–5)",
  "Evening",
  "Night",
  "Full Time",
  "Part Time",
];

interface FilterBarProps {
  workFilter: string;
  timeFilter: string;
  placeFilter: string;
  salaryMin: string;
  salaryMax: string;
  onWorkChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onPlaceChange: (value: string) => void;
  onSalaryMinChange: (value: string) => void;
  onSalaryMaxChange: (value: string) => void;
  onReset: () => void;
}

export function FilterBar({
  workFilter,
  timeFilter,
  placeFilter,
  salaryMin,
  salaryMax,
  onWorkChange,
  onTimeChange,
  onPlaceChange,
  onSalaryMinChange,
  onSalaryMaxChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters =
    workFilter !== "All" ||
    timeFilter !== "All" ||
    placeFilter !== "" ||
    salaryMin !== "" ||
    salaryMax !== "";

  return (
    <div className="mb-6 sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b -mx-4 px-4 md:mx-0 md:px-0 md:border-b-0">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Work Type */}
        <select
          value={workFilter}
          onChange={(e) => onWorkChange(e.target.value)}
          className="flex-1 min-w-[140px] px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {WORK_OPTIONS.map((option) => (
            <option key={option} value={option === "All Work Types" ? "All" : option}>
              {option}
            </option>
          ))}
        </select>

        {/* Time */}
        <select
          value={timeFilter}
          onChange={(e) => onTimeChange(e.target.value)}
          className="flex-1 min-w-[140px] px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {TIME_OPTIONS.map((option) => (
            <option key={option} value={option === "All Times" ? "All" : option}>
              {option}
            </option>
          ))}
        </select>

        {/* Place */}
        <input
          type="text"
          placeholder="Location..."
          value={placeFilter}
          onChange={(e) => onPlaceChange(e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {/* Salary Range Toggle */}
        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <input
            type="text"
            placeholder="Min Salary"
            value={salaryMin}
            onChange={(e) => onSalaryMinChange(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-muted-foreground text-sm">-</span>
          <input
            type="text"
            placeholder="Max Salary"
            value={salaryMax}
            onChange={(e) => onSalaryMaxChange(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap flex-shrink-0"
          >
            Reset
          </button>
        )}

        {/* Create Post Button */}
        <Link href={appConfig.routes.post} className="flex-shrink-0">
          <Button className="whitespace-nowrap">+ Create Post</Button>
        </Link>
      </div>
    </div>
  );
}
