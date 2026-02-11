"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  PlusCircle, 
  HelpCircle, 
  MessageSquare, 
  BookOpen, 
  Menu, 
  X 
} from "lucide-react";
import { appConfig } from "@/lib/config";
import AdminButton from "@/components/AdminButton";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onCreatePost?: () => void;
  onFAQ?: () => void;
  onContact?: () => void;
  onHowItWorks?: () => void;
}

export function Sidebar({ isOpen, onToggle, onCreatePost, onFAQ, onContact, onHowItWorks }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: Home,
      label: "Home",
      href: appConfig.routes.home,
      isActive: pathname === appConfig.routes.home,
      isNavigation: true,
    },
    {
      icon: BookOpen,
      label: "How It Works",
      href: "/pages/about",
      isActive: pathname === "/pages/about",
      isNavigation: false,
      action: onHowItWorks,
    },
    {
      icon: MessageSquare,
      label: "FAQ",
      href: "/pages/faq",
      isActive: pathname === "/pages/faq",
      isNavigation: false,
      action: onFAQ,
    },
    {
      icon: HelpCircle,
      label: "Contact",
      href: "/pages/contact",
      isActive: pathname === "/pages/contact",
      isNavigation: false,
      action: onContact,
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
              {/* Main Navigation */}
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  item.isNavigation ? (
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
                  ) : (
                    <Button
                      key={item.label}
                      variant={item.isActive ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 h-12 ${
                        item.isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        // Call the action handler
                        item.action?.();
                        // Close mobile menu after action
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  )
                );
              })}
            </div>
          </nav>

          {/* Fixed Create Post Button */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={() => {
                onCreatePost?.();
                // Close mobile menu after action
                if (window.innerWidth < 1024) {
                  onToggle();
                }
              }}
              className="w-full justify-start gap-3 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="font-medium">Create Post</span>
            </Button>
          </div>

          {/* Admin Section */}
          <div className="p-4 border-t border-gray-200 mt-auto">
            <AdminButton />
          </div>
        </div>
      </div>
    </>
  );
}
