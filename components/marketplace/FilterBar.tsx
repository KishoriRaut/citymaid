"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { appConfig } from "@/lib/config";
import { getAllWorkTypes } from "@/lib/work-types";
import { getAllTimeOptions } from "@/lib/work-time";
import { getPostedTimeOptions } from "@/lib/posted-time";

const WORK_OPTIONS = ["All Work Types", ...getAllWorkTypes()];
const TIME_OPTIONS = ["All Times", ...getAllTimeOptions()];
const POSTED_TIME_OPTIONS = getPostedTimeOptions();

interface FilterBarProps {
  workFilter: string;
  timeFilter: string;
  postedTimeFilter: string;
  placeFilter: string;
  salaryFilter: string;
  onWorkChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onPostedTimeChange: (value: string) => void;
  onPlaceChange: (value: string) => void;
  onSalaryChange: (value: string) => void;
  onReset: () => void;
}

export function FilterBar({
  workFilter,
  timeFilter,
  postedTimeFilter,
  placeFilter,
  salaryFilter,
  onWorkChange,
  onTimeChange,
  onPostedTimeChange,
  onPlaceChange,
  onSalaryChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters =
    workFilter !== "All" ||
    timeFilter !== "All" ||
    postedTimeFilter !== "all" ||
    placeFilter !== "" ||
    salaryFilter !== "";

  return (
    <div className="mb-8 sticky top-0 z-40 bg-background border-b border-border/50 shadow-sm -mx-4 px-4 md:mx-0 md:px-0 md:border-b-0 md:shadow-none md:bg-background/95 md:backdrop-blur md:supports-[backdrop-filter]:md:bg-background/60">
      <div className="py-5">
        {/* Desktop Layout: Horizontal Row */}
        <div className="hidden md:flex items-center gap-4">
          {/* Work Type */}
          <div className="w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Work Type
            </label>
            <Select value={workFilter} onValueChange={onWorkChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select work type" />
              </SelectTrigger>
              <SelectContent>
                {WORK_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option === "All Work Types" ? "All" : option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time */}
          <div className="w-[160px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Time
            </label>
            <Select value={timeFilter} onValueChange={onTimeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option === "All Times" ? "All" : option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Posted Time */}
          <div className="w-[160px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Posted
            </label>
            <Select value={postedTimeFilter} onValueChange={(value) => {
              console.log(`🔄 FilterBar desktop postedTime changed to: ${value}`);
              onPostedTimeChange(value);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="When posted" />
              </SelectTrigger>
              <SelectContent>
                {POSTED_TIME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Location
            </label>
            <Input
              type="text"
              placeholder="Search location..."
              value={placeFilter}
              onChange={(e) => onPlaceChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Salary */}
          <div className="w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Salary
            </label>
            <Input
              type="text"
              placeholder="Search salary..."
              value={salaryFilter}
              onChange={(e) => onSalaryChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2 ml-auto">
            {hasActiveFilters && (
              <Button variant="outline" onClick={onReset} className="text-sm font-medium hover:bg-primary/10 hover:border-primary/30 transition-colors duration-200 whitespace-nowrap">
                Reset
              </Button>
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
              <Select value={workFilter} onValueChange={onWorkChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Work type" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option === "All Work Types" ? "All" : option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Time
              </label>
              <Select value={timeFilter} onValueChange={onTimeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option === "All Times" ? "All" : option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 1.5: Posted Time */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Posted
            </label>
            <Select value={postedTimeFilter} onValueChange={(value) => {
              console.log(`🔄 FilterBar mobile postedTime changed to: ${value}`);
              onPostedTimeChange(value);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="When posted" />
              </SelectTrigger>
              <SelectContent>
                {POSTED_TIME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Location */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Location
            </label>
            <Input
              type="text"
              placeholder="Search location..."
              value={placeFilter}
              onChange={(e) => onPlaceChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Row 3: Salary */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Salary
            </label>
            <Input
              type="text"
              placeholder="Search salary..."
              value={salaryFilter}
              onChange={(e) => onSalaryChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Row 4: Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            {hasActiveFilters && (
              <Button variant="outline" onClick={onReset} className="flex-1 text-sm font-medium hover:bg-primary/10 hover:border-primary/30 transition-colors duration-200 whitespace-nowrap">
                Reset Filters
              </Button>
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
