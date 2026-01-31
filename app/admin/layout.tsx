"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  BarChart3, 
  Settings,
  Bell,
  Menu,
  User as UserIcon,
  LogOut,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearSession, type User } from "@/lib/session";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate authentication check
    const timer = setTimeout(() => {
      const mockUser = {
        id: "admin-123",
        email: "admin@test.com",
        role: "admin",
        created_at: new Date().toISOString()
      };
      setUser(mockUser);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const navigation = [
    {
      name: "Requests",
      href: "/admin/requests",
      icon: FileText,
      current: pathname === "/admin/requests",
      description: "Manage posts and contact unlocks"
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
      current: pathname === "/admin/reports",
      description: "View analytics and insights"
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: pathname === "/admin/settings",
      description: "System configuration"
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: UserIcon,
      current: pathname === "/admin/profile",
      description: "Account settings"
    },
  ];

  const handleLogout = async () => {
    try {
      clearSession();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle navigation to ensure proper state management
  const handleNavigation = (href: string) => {
    router.push(href);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading state while authenticating
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <Link href="/admin/requests" className="text-xl font-bold text-primary">
                CityMaid Admin
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex flex-col gap-y-1 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                      ${item.current
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }
                    `}
                    onClick={() => {
                      setSidebarOpen(false);
                      handleNavigation(item.href);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <p className={`text-xs ml-7 ${
                      item.current 
                        ? "text-primary-foreground/80" 
                        : "text-muted-foreground"
                    }`}>
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/admin/requests" className="text-xl font-bold text-primary">
              CityMaid Admin
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex flex-col gap-y-1 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200
                        ${item.current
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }
                      `}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <div className="flex items-center gap-x-3">
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <p className={`text-xs ml-8 ${
                        item.current 
                          ? "text-primary-foreground/80" 
                          : "text-muted-foreground"
                      }`}>
                        {item.description}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
          </Sheet>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold">Requests</h1>
            </div>
            
            {/* Right side icons */}
            <div className="flex items-center gap-x-4">
              {/* Notification bell */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-accent/50 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="sr-only">View notifications</span>
                {/* Notification badge */}
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center ring-2 ring-background">
                  <span className="text-xs text-white font-medium">3</span>
                </span>
                {/* Pulse animation for new notifications */}
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 rounded-full animate-ping opacity-75"></span>
              </Button>
              
              {/* User profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/50 transition-colors">
                    <Avatar className="h-10 w-10 border-2 border-border">
                      <AvatarImage src="" alt={user.email} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-2 border-border">
                          <AvatarImage src="" alt={user.email} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="text-sm font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Administrator
                          </p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile" className="flex items-center cursor-pointer">
                      <UserIcon className="mr-3 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Profile</span>
                        <span className="text-xs text-muted-foreground">Account settings</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-3 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Settings</span>
                        <span className="text-xs text-muted-foreground">System configuration</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-3 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>Logout</span>
                      <span className="text-xs text-muted-foreground">Sign out of account</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
