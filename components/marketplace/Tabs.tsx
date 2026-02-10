"use client";

import { Tabs as ShadcnTabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CustomTabsProps {
  activeTab: "all" | "employer" | "employee";
  onTabChange: (tab: "employer" | "employee") => void;
}

export function Tabs({ activeTab, onTabChange }: CustomTabsProps) {
  return (
    <ShadcnTabs value={activeTab} onValueChange={(value: string) => onTabChange(value as "employer" | "employee")}>
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="employee" className="text-base font-semibold">
          Find a Job
        </TabsTrigger>
        <TabsTrigger value="employer" className="text-base font-semibold">
          Hire a Worker
        </TabsTrigger>
      </TabsList>
    </ShadcnTabs>
  );
}
