"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, type User } from "@/lib/session";
import { isAdminUser } from "@/lib/auth-utils";

export default function AdminDebugPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsAdmin(user ? isAdminUser(user.email) : false);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Debug Information</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current User Status</h2>
            <p><strong>User:</strong> {currentUser ? JSON.stringify(currentUser, null, 2) : 'No user logged in'}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Admin Emails</h2>
            <p>admin@citymaid.com</p>
            <p>kishoriraut.dev@gmail.com</p>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
            <button 
              onClick={() => {
                // Test admin check
                const testEmail = "kishoriraut.dev@gmail.com";
                alert(`Is "${testEmail}" admin? ${isAdminUser(testEmail)}`);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Test Admin Check
            </button>
            
            <button 
              onClick={() => {
                // Clear session
                localStorage.removeItem("user");
                window.location.reload();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear Session
            </button>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Navigation</h2>
            <a href="/login" className="text-blue-500 underline block mb-2">Go to Login</a>
            <a href="/admin" className="text-blue-500 underline block mb-2">Go to Admin Dashboard</a>
            <a href="/" className="text-blue-500 underline block">Go to Homepage</a>
          </div>
        </div>
      </div>
    </div>
  );
}
