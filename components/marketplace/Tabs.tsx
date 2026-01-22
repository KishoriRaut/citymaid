"use client";

interface TabsProps {
  activeTab: "all" | "employer" | "employee";
  onTabChange: (tab: "all" | "employer" | "employee") => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onTabChange("all")}
        className={`flex-1 px-6 py-3 rounded-lg text-base font-semibold transition-all ${
          activeTab === "all"
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        All
      </button>
      <button
        onClick={() => onTabChange("employer")}
        className={`flex-1 px-6 py-3 rounded-lg text-base font-semibold transition-all ${
          activeTab === "employer"
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        Hire a Worker
      </button>
      <button
        onClick={() => onTabChange("employee")}
        className={`flex-1 px-6 py-3 rounded-lg text-base font-semibold transition-all ${
          activeTab === "employee"
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        Find a Job
      </button>
    </div>
  );
}
