"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Bell, Shield, Database, Mail } from "lucide-react";
import { type User } from "@/lib/session";

export default function AdminSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock user for development
    const mockUser = {
      id: "admin-123",
      email: "admin@test.com",
      role: "admin",
      created_at: new Date().toISOString()
    };
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your admin account and system settings</p>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your admin account and system settings</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={user.email} />
                <AvatarFallback className="text-lg">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">Change Avatar</Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, GIF or PNG. Max size of 2MB
                </p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={user.email} 
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact system administrator.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us about yourself"
                className="resize-none"
                rows={3}
              />
            </div>
            
            <Button>Save Profile Changes</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about new posts and payments
                </p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when new payments require approval
                </p>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">System Updates</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about system maintenance and updates
                </p>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>
              Manage your account security and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">
                  Last changed 30 days ago
                </p>
              </div>
              <Button variant="outline" size="sm">Change Password</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" size="sm">Enable 2FA</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Active Sessions</p>
                <p className="text-sm text-muted-foreground">
                  Manage your active login sessions
                </p>
              </div>
              <Button variant="outline" size="sm">View Sessions</Button>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>System Settings</CardTitle>
            </div>
            <CardDescription>
              Configure system-wide settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Database Maintenance</p>
                <p className="text-sm text-muted-foreground">
                  Perform database cleanup and optimization
                </p>
              </div>
              <Button variant="outline" size="sm">Maintenance</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-muted-foreground">
                  Export posts, payments, and user data
                </p>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">System Logs</p>
                <p className="text-sm text-muted-foreground">
                  View system activity and error logs
                </p>
              </div>
              <Button variant="outline" size="sm">View Logs</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
