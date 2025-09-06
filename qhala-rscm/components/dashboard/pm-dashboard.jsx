// components/dashboard/dashboards/PMDashboard.jsx
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
import { Users, FolderOpen, Clock, AlertCircle, Plus, Eye } from "lucide-react";

const PMDashboard = ({ user }) => {
  const { loading, error, data } = useDashboard();

  const quickActions = [
    { label: "New Project", icon: Plus, href: "/projects/new" },
    { label: "My Projects", icon: FolderOpen, href: "/projects" },
    { label: "Resources", icon: Users, href: "/resources" },
    { label: "Reports", icon: Eye, href: "/reports" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={32} />
          <p className="mt-4 text-gray-600">Loading PM dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <ErrorDisplay message={error} />
      </div>
    );
  }

  // Generate resource suggestions based on pending requests
  const resourceSuggestions = [
    "React Developer for Q1 Initiative",
    "UX Designer for Mobile Project",
    "DevOps Engineer for Infrastructure",
  ];

  // Get project status breakdown
  const projectsByStatus = data.projectsByStatus || {};
  const activeProjects = projectsByStatus.active || 0;
  const planningProjects = projectsByStatus.planning || 0;
  const completedProjects = projectsByStatus.completed || 0;
  const onHoldProjects = projectsByStatus.on_hold || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="p-6 max-w-7xl mx-auto">
        <HeroSection
          user={user}
          quickActions={quickActions}
          gradientFrom="from-green-600"
          gradientTo="to-emerald-700"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Key Metrics */}
          <div className="space-y-6">
            <MetricTile
              title="Managed Projects"
              value={data.managedProjects}
              icon={FolderOpen}
              color="green"
              subtitle="Active projects"
            />

            <MetricTile title="Team Utilization" icon={Users} color="blue">
              <div className="flex items-center justify-center">
                <ProgressRing
                  progress={data.teamUtilization}
                  size={100}
                  strokeWidth={8}
                  color="blue"
                />
              </div>
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {data.teamUtilization}%
                </div>
                <div className="text-sm text-gray-500">Team capacity used</div>
              </div>
            </MetricTile>

            <MetricTile
              title="Pending Requests"
              value={data.pendingRequests}
              icon={AlertCircle}
              color="orange"
              subtitle="Need your approval"
            />
          </div>

          {/* Middle Column - Projects Overview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-green-600" />
                Projects Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {activeProjects}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {planningProjects}
                  </div>
                  <div className="text-sm text-gray-600">Planning</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {completedProjects}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {onHoldProjects}
                  </div>
                  <div className="text-sm text-gray-600">On Hold</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Urgent Actions
              </h3>
              <div className="space-y-3">
                {data.pendingRequests > 0 ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <div className="font-medium text-gray-900">
                          Resource Requests
                        </div>
                        <div className="text-sm text-gray-500">
                          {data.pendingRequests} pending approval
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        Urgent
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <div className="font-medium text-gray-900">
                          Team Review
                        </div>
                        <div className="text-sm text-gray-500">
                          Weekly capacity check
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        Due Soon
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-green-600 font-medium">
                      All caught up!
                    </div>
                    <div className="text-sm text-gray-500">
                      No urgent actions needed
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Activity & AI */}
          <div className="space-y-6">
            <ActivityFeed activities={data.activities} />
            <AIExploreSection
              title="Resource Suggestions"
              suggestions={resourceSuggestions}
              color="green"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PMDashboard;
