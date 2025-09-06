// components/dashboard/dashboards/HRDashboard.jsx
import React from "react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import {
  HeroSection,
  MetricTile,
  ActivityFeed,
  AIExploreSection,
  ProgressRing,
  LoadingSpinner,
  ErrorDisplay,
} from "@/components/dashboard/dashboard-components";
import {
  Users,
  FolderOpen,
  TrendingUp,
  CheckSquare,
  Settings,
  BarChart3,
} from "lucide-react";

const HRDashboard = ({ user }) => {
  const { loading, error, data } = useDashboard();

  const quickActions = [
    { label: "Manage Users", icon: Users, href: "/admin/users" },
    { label: "Manage Skills", icon: Settings, href: "/admin/skills" },
    { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { label: "Reports", icon: CheckSquare, href: "/admin/reports" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={32} />
          <p className="mt-4 text-gray-600">Loading HR dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-6">
        <ErrorDisplay message={error} />
      </div>
    );
  }

  // Generate trending skills suggestions
  const trendingSkills = [
    `${data.mostCommon?.name || "JavaScript"} - Most Common`,
    `${data.mostDesired?.name || "TypeScript"} - Most Desired`,
    "Cloud Architecture - Growing 20%",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="p-6 max-w-7xl mx-auto">
        <HeroSection
          user={user}
          quickActions={quickActions}
          gradientFrom="from-purple-600"
          gradientTo="to-pink-700"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Organization Metrics */}
          <div className="space-y-6">
            <MetricTile
              title="Total Users"
              value={data.totalUsers}
              icon={Users}
              color="purple"
              subtitle="Active employees"
              growth={data.totalUsers > 0 ? "+12% this month" : undefined}
            />

            <MetricTile
              title="Total Projects"
              value={data.totalProjects}
              icon={FolderOpen}
              color="blue"
              subtitle="Organization-wide"
            />

            <MetricTile title="Org Utilization" icon={TrendingUp} color="green">
              <div className="flex items-center justify-center">
                <ProgressRing
                  progress={data.overallUtilization}
                  size={100}
                  strokeWidth={8}
                  color="green"
                />
              </div>
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {data.overallUtilization}%
                </div>
                <div className="text-sm text-gray-500">Average utilization</div>
              </div>
            </MetricTile>
          </div>

          {/* Middle Column - Skills & Approvals */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Skills Overview
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {data.uniqueSkills}
                  </div>
                  <div className="text-sm text-gray-600">Unique Skills</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-blue-600">
                    {data.mostCommon?.name || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Most Common ({data.mostCommon?.count || 0} users)
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-green-600">
                    {data.mostDesired?.name || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Most Desired ({data.mostDesired?.count || 0} users)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-orange-600" />
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      Active Users
                    </div>
                    <div className="text-sm text-gray-500">
                      {data.totalUsers} registered
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      Projects Running
                    </div>
                    <div className="text-sm text-gray-500">
                      {data.totalProjects} total
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                    {data.totalProjects}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Trends */}
          <div className="space-y-6">
            <ActivityFeed activities={data.activities} />
            <AIExploreSection
              title="Trending Skills"
              suggestions={trendingSkills}
              color="purple"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
