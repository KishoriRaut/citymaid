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
  salaryFilter: string;
  onWorkChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onPlaceChange: (value: string) => void;
  onSalaryChange: (value: string) => void;
  onReset: () => void;
}

export function FilterBar({
  workFilter,
  timeFilter,
  placeFilter,
  salaryFilter,
  onWorkChange,
  onTimeChange,
  onPlaceChange,
  onSalaryChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters =
    workFilter !== "All" ||
    timeFilter !== "All" ||
    placeFilter !== "" ||
    salaryFilter !== "";

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Work Type */}
        <select
          value={workFilter}
          onChange={(e) => onWorkChange(e.target.value)}
          className="flex-1 min-w-[140px] px-3 py-2 border rounded-md bg-background text-sm"
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
          className="flex-1 min-w-[140px] px-3 py-2 border rounded-md bg-background text-sm"
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
          placeholder="Place..."
          value={placeFilter}
          onChange={(e) => onPlaceChange(e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-2 border rounded-md bg-background text-sm"
        />

        {/* Salary */}
        <input
          type="text"
          placeholder="Salary..."
          value={salaryFilter}
          onChange={(e) => onSalaryChange(e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-2 border rounded-md bg-background text-sm"
        />

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap flex-shrink-0"
          >
            Reset filters
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
