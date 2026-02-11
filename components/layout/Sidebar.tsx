"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  PlusCircle, 
  Settings, 
  HelpCircle, 
  Menu, 
  X,
  Briefcase,
  Users
} from "lucide-react";
import { appConfig } from "@/lib/config";
import AdminButton from "@/components/AdminButton";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"employee" | "employer">("employee");

  const handleTabChange = (tab: "employee" | "employer") => {
    setActiveTab(tab);
    // Dispatch custom event to notify homepage
    window.dispatchEvent(new CustomEvent('sidebarTabChange', { 
      detail: { tab } 
    }));
    // Close mobile menu after tab selection
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const menuItems = [
    {
      icon: Home,
      label: "Home",
      href: appConfig.routes.home,
      isActive: pathname === appConfig.routes.home,
    },
    {
      icon: PlusCircle,
      label: "Create Post",
      href: appConfig.routes.post,
      isActive: pathname === appConfig.routes.post,
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
      isActive: pathname === "/settings",
    },
    {
      icon: HelpCircle,
      label: "Help",
      href: "/help",
      isActive: pathname === "/help",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <Link 
              href={appConfig.routes.home}
              className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
            >
              {appConfig.brand.name}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {/* Job Type Tabs */}
              <Button
                variant={activeTab === "employee" ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-12 ${
                  activeTab === "employee" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => handleTabChange("employee")}
              >
                <Briefcase className="h-5 w-5" />
                <span className="font-medium">Find a Job</span>
              </Button>
              <Button
                variant={activeTab === "employer" ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-12 ${
                  activeTab === "employer" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => handleTabChange("employer")}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Hire a Worker</span>
              </Button>

              {/* Main Navigation */}
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={item.isActive ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 h-12 ${
                        item.isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        // Close mobile menu after navigation
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Admin Section */}
          <div className="p-4 border-t border-gray-200 mt-auto">
            <AdminButton />
          </div>
        </div>
      </div>
    </>
  );
}
