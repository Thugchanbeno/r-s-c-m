// components/dashboard/dashboards/EmployeeDashboard.jsx
import React from "react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import {
  HeroSection,
  MetricTile,
  ActivityFeed,
  AIExploreSection,
  ProgressRing,
  ProjectCard,
  LoadingSpinner,
  ErrorDisplay,
} from "@/components/dashboard/dashboard-components";
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  User,
  Briefcase,
} from "lucide-react";

const EmployeeDashboard = ({ user }) => {
  const { loading, error, data } = useDashboard();

  const quickActions = [
    { label: "My Tasks", icon: Calendar, href: "/tasks" },
    { label: "Time Log", icon: Clock, href: "/time" },
    { label: "Skills", icon: Target, href: "/profile" },
    { label: "Projects", icon: Briefcase, href: "/projects" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={32} />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <ErrorDisplay message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto">
        <HeroSection
          user={user}
          quickActions={quickActions}
          gradientFrom="from-blue-600"
          gradientTo="to-indigo-700"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Metrics */}
          <div className="space-y-6">
            <MetricTile title="My Capacity" icon={User} color="blue">
              <div className="flex items-center justify-center">
                <ProgressRing
                  progress={data.capacity}
                  size={100}
                  strokeWidth={8}
                  color="blue"
                />
              </div>
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {data.capacity}%
                </div>
                <div className="text-sm text-gray-500">
                  {data.allocatedHours}h / {data.standardHours}h this week
                </div>
              </div>
            </MetricTile>

            <MetricTile
              title="Active Projects"
              value={data.activeProjects}
              icon={Briefcase}
              color="green"
              subtitle="Projects assigned"
            />

            <MetricTile
              title="Skills Count"
              value={data.skillsCount}
              icon={Target}
              color="purple"
              subtitle="Verified skills"
            />
          </div>

          {/* Middle Column - Projects & Week */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                My Projects
              </h3>
              <div className="space-y-4">
                {data.projects.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No active projects
                  </p>
                ) : (
                  data.projects
                    .slice(0, 3)
                    .map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                This Week
              </h3>
              <div className="space-y-3">
                {data.upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No upcoming events
                  </p>
                ) : (
                  data.upcomingEvents.slice(0, 3).map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.date}
                        </div>
                      </div>
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Activity & AI */}
          <div className="space-y-6">
            <ActivityFeed activities={data.activities} />
            <AIExploreSection
              title="Suggested Skills"
              suggestions={data.suggestedSkills}
              color="blue"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
