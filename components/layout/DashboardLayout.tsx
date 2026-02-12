"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onCreatePost?: () => void;
  onCreateProfile?: () => void;
  onPostJob?: () => void;
  onFAQ?: () => void;
  onContact?: () => void;
  onHowItWorks?: () => void;
}

export function DashboardLayout({ children, onCreatePost, onCreateProfile, onPostJob, onFAQ, onContact, onHowItWorks }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 z-40">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onCreatePost={onCreatePost} onCreateProfile={onCreateProfile} onPostJob={onPostJob} onFAQ={onFAQ} onContact={onContact} onHowItWorks={onHowItWorks} />
      </div>
      
      {/* Main Content Area */}
      <div className="lg:ml-64 min-h-screen">
        <DashboardHeader 
          onMenuToggle={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
        
        {/* Dashboard Content - Right Side */}
        <main className="flex-1 p-6">
          <div className="main-content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
