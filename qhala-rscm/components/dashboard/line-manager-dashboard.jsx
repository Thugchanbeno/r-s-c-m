// components/dashboard/dashboards/ManagerDashboard.jsx
import React from "react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import {
  HeroSection,
  MetricTile,
  ActivityFeed,
  AIExploreSection,
  LoadingSpinner,
  ErrorDisplay,
} from "@/components/dashboard/dashboard-components";
import { Users, CheckSquare, Clock, Eye, UserCheck, Award } from "lucide-react";

const ManagerDashboard = ({ user }) => {
  const { loading, error, data } = useDashboard();

  const quickActions = [
    { label: "Approve Requests", icon: CheckSquare, href: "/approvals" },
    { label: "View Team", icon: Users, href: "/team" },
    { label: "Reports", icon: Eye, href: "/reports" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={32} />
          <p className="mt-4 text-gray-600">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 flex items-center justify-center p-6">
        <ErrorDisplay message={error} />
      </div>
    );
  }

  // Generate team insights based on direct reports
  const teamInsights =
    data.directReports.length > 0
      ? data.directReports
          .slice(0, 3)
          .map(
            (report) => `${report.name} - ${report.utilization || 75}% utilized`
          )
      : [
          "No direct reports found",
          "Team data will appear here",
          "Check user assignments",
        ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100">
      <div className="p-6 max-w-7xl mx-auto">
        <HeroSection
          user={user}
          quickActions={quickActions}
          gradientFrom="from-indigo-600"
          gradientTo="to-cyan-700"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Team Metrics */}
          <div className="space-y-6">
            <MetricTile
              title="Direct Reports"
              value={data.directReports.length}
              icon={Users}
              color="indigo"
              subtitle="Team members"
            />

            <MetricTile
              title="Skill Verifications"
              value={data.pendingSkillVerifications}
              icon={Award}
              color="yellow"
              subtitle="Pending review"
            />

            <MetricTile
              title="Approvals Needed"
              value={data.approvalsNeeded}
              icon={CheckSquare}
              color="red"
              subtitle="Require attention"
            />
          </div>

          {/* Middle Column - Team Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Direct Reports
              </h3>
              <div className="space-y-3">
                {data.directReports.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No direct reports assigned
                  </p>
                ) : (
                  data.directReports.map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${report.available !== false ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {report.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.role || "Team Member"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {report.utilization || 75}%
                        </div>
                        <div className="text-xs text-gray-500">utilized</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Urgent Actions
              </h3>
              <div className="space-y-3">
                {data.pendingSkillVerifications > 0 ||
                data.approvalsNeeded > 0 ? (
                  <>
                    {data.pendingSkillVerifications > 0 && (
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <div className="font-medium text-gray-900">
                            Skill Verifications
                          </div>
                          <div className="text-sm text-gray-500">
                            {data.pendingSkillVerifications} pending review
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      </div>
                    )}
                    {data.approvalsNeeded > 0 && (
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <div className="font-medium text-gray-900">
                            Team Requests
                          </div>
                          <div className="text-sm text-gray-500">
                            {data.approvalsNeeded} need approval
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Urgent
                        </span>
                      </div>
                    )}
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
              title="Team Insights"
              suggestions={teamInsights}
              color="indigo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
