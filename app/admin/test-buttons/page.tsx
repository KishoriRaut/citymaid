"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, EyeOff, Edit, Trash2, User } from "lucide-react";

export default function AdminTestPage() {
  const [email, setEmail] = useState("kishoriraut369@gmail.com");
  const [password, setPassword] = useState("admin123k");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin-login-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        console.log('✅ Admin login successful:', data);
      } else {
        setError(data.error || 'Login failed');
        console.error('❌ Admin login failed:', data);
      }
    } catch (error) {
      setError('Network error');
      console.error('❌ Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testButtons = async () => {
    try {
      const response = await fetch('/api/test-admin-buttons');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError('Failed to test buttons');
      console.error('❌ Button test error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Admin Functionality Test</h1>
          <p className="text-muted-foreground">Test admin login and button functionality</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Admin Login Test
              </CardTitle>
              <CardDescription>
                Test admin authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin email"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin password"
                />
              </div>
              <Button 
                onClick={testLogin} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Testing..." : "Test Login"}
              </Button>
            </CardContent>
          </Card>

          {/* Button Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Button Functionality Test
              </CardTitle>
              <CardDescription>
                Test all admin button functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testButtons} 
                variant="outline"
                className="w-full"
              >
                Test All Buttons
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Button Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Button Functions</CardTitle>
            <CardDescription>
              What each admin button should do
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span><strong>Approve:</strong> Approve pending post</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-gray-600" />
                <span><strong>Hide:</strong> Hide post from public view</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-600" />
                <span><strong>Edit:</strong> Open post edit page</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-600" />
                <span><strong>Delete:</strong> Remove post permanently</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
