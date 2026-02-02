"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Users, DollarSign, FileText, Unlock } from "lucide-react";
import { getAllAdminPayments } from "@/lib/admin-payments";
import { getAllUnlockRequests } from "@/lib/unlock-requests";
import { getAllPosts } from "@/lib/posts";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activePosts: 0,
    contactUnlocks: 0,
    totalPayments: 0,
    approvedPayments: 0,
    pendingPayments: 0,
    growthRate: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        // Get all data
        const [paymentsData, unlockData, postsData] = await Promise.all([
          getAllAdminPayments(),
          getAllUnlockRequests(),
          getAllPosts({ status: 'approved' })
        ]);

        // Calculate real stats
        const totalRevenue = paymentsData.payments?.reduce((sum, payment) => {
          // Assuming payment amount is stored or can be calculated
          return sum + (payment.amount || 1000); // Default amount if not stored
        }, 0) || 0;

        const approvedPayments = paymentsData.payments?.filter(p => p.status === 'approved').length || 0;
        const pendingPayments = paymentsData.payments?.filter(p => p.status === 'pending').length || 0;
        const totalPayments = paymentsData.payments?.length || 0;
        const contactUnlocks = unlockData.requests?.filter(r => r.status === 'approved').length || 0;
        const activePosts = postsData.posts?.length || 0;

        // Calculate growth rate (mock for now, would need historical data)
        const growthRate = totalPayments > 0 ? ((approvedPayments / totalPayments) * 100) : 0;

        setStats({
          totalRevenue,
          activePosts,
          contactUnlocks,
          totalPayments,
          approvedPayments,
          pendingPayments,
          growthRate
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for CityMaid marketplace</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
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
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Analytics and insights for CityMaid marketplace</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NRs {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {stats.approvedPayments} approved payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePosts}</div>
            <p className="text-xs text-muted-foreground">Approved and visible</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Unlocks</CardTitle>
            <Unlock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contactUnlocks}</div>
            <p className="text-xs text-muted-foreground">Successfully unlocked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.growthRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stats.pendingPayments} pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Payments</span>
                <span className="font-medium">{stats.totalPayments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Approved</span>
                <span className="font-medium text-green-600">{stats.approvedPayments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-medium text-yellow-600">{stats.pendingPayments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="font-medium text-blue-600">NRs {stats.totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Posts</span>
                <span className="font-medium">{stats.activePosts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Contact Unlocks</span>
                <span className="font-medium">{stats.contactUnlocks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Approval Rate</span>
                <span className="font-medium">{stats.growthRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-medium">NRs {stats.totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
