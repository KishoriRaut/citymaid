"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appConfig } from "@/lib/config";
import { clearSession, type User } from "@/lib/session";

interface AdminHeaderProps {
  user: User;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push(appConfig.routes.login);
  };

  const userInitials = user.email.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-6">
            <Link href={appConfig.routes.admin} className="text-xl font-bold text-primary hover:opacity-80">
              {appConfig.brand.name}
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href={appConfig.routes.post}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Create Post
              </Link>
              <Link
                href={appConfig.routes.admin}
                className="text-sm font-medium text-foreground"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {userInitials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground max-w-[150px] truncate">
                  {user.email}
                </span>
                <svg
                  className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover shadow-lg">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Member since {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={appConfig.routes.adminProfile}
                      className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Account Info
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors text-destructive"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
