"use client";

interface TabsProps {
  activeTab: "all" | "employer" | "employee";
  onTabChange: (tab: "all" | "employer" | "employee") => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-2 mb-8">
      <button
        onClick={() => onTabChange("all")}
        className={`flex-1 px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
          activeTab === "all"
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow"
            : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:border-primary/20 border border-transparent"
        }`}
      >
        All
      </button>
      <button
        onClick={() => onTabChange("employer")}
        className={`flex-1 px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
          activeTab === "employer"
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow"
            : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:border-primary/20 border border-transparent"
        }`}
      >
        Hire a Worker
      </button>
      <button
        onClick={() => onTabChange("employee")}
        className={`flex-1 px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
          activeTab === "employee"
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow"
            : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:border-primary/20 border border-transparent"
        }`}
      >
        Find a Job
      </button>
    </div>
  );
}
