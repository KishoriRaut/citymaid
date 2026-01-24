"use client";

import Link from "next/link";
import { Button } from "@/components/shared/button";
import { appConfig } from "@/lib/config";
import { getAllWorkTypes } from "@/lib/work-types";
import { getAllTimeOptions } from "@/lib/work-time";

const WORK_OPTIONS = ["All Work Types", ...getAllWorkTypes()];
const TIME_OPTIONS = ["All Times", ...getAllTimeOptions()];

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
    <div className="mb-8 sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50 shadow-sm -mx-4 px-4 md:mx-0 md:px-0 md:border-b-0 md:shadow-none">
      <div className="py-5">
        {/* Desktop Layout: Horizontal Row */}
        <div className="hidden md:flex items-center gap-4">
          {/* Work Type */}
          <div className="w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Work Type
            </label>
            <select
              value={workFilter}
              onChange={(e) => onWorkChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200"
            >
              {WORK_OPTIONS.map((option) => (
                <option key={option} value={option === "All Work Types" ? "All" : option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="w-[160px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Time
            </label>
            <select
              value={timeFilter}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200"
            >
              {TIME_OPTIONS.map((option) => (
                <option key={option} value={option === "All Times" ? "All" : option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Location
            </label>
            <input
              type="text"
              placeholder="Search location..."
              value={placeFilter}
              onChange={(e) => onPlaceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Salary */}
          <div className="w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Salary
            </label>
            <input
              type="text"
              placeholder="Search salary..."
              value={salaryFilter}
              onChange={(e) => onSalaryChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2 ml-auto">
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 whitespace-nowrap border border-border rounded-lg hover:bg-primary/10 hover:border-primary/30"
              >
                Reset
              </button>
            )}
            <Link href={appConfig.routes.post}>
              <Button size="lg" className="whitespace-nowrap shadow-sm hover:shadow transition-shadow duration-200">
                + Create Post
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Layout: Stacked */}
        <div className="md:hidden space-y-3">
          {/* Row 1: Work Type and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Work Type
              </label>
              <select
                value={workFilter}
                onChange={(e) => onWorkChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200"
              >
                {WORK_OPTIONS.map((option) => (
                  <option key={option} value={option === "All Work Types" ? "All" : option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Time
              </label>
              <select
                value={timeFilter}
                onChange={(e) => onTimeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200"
              >
                {TIME_OPTIONS.map((option) => (
                  <option key={option} value={option === "All Times" ? "All" : option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Location */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Location
            </label>
            <input
              type="text"
              placeholder="Search location..."
              value={placeFilter}
              onChange={(e) => onPlaceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Row 3: Salary */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Salary
            </label>
            <input
              type="text"
              placeholder="Search salary..."
              value={salaryFilter}
              onChange={(e) => onSalaryChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Row 4: Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 border border-border rounded-lg hover:bg-primary/10 hover:border-primary/30"
              >
                Reset Filters
              </button>
            )}
            <Link href={appConfig.routes.post} className={hasActiveFilters ? "flex-1" : "w-full"}>
              <Button size="lg" className="w-full whitespace-nowrap shadow-sm hover:shadow transition-shadow duration-200">
                + Create Post
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
