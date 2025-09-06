// components/dashboard/dashboard-components.jsx
import React from "react";
import Link from "next/link";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Sparkles,
} from "lucide-react";

// Activity Feed Component
export const ActivityFeed = ({ activities = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case "task":
        return AlertCircle;
      case "completion":
        return CheckCircle;
      case "skill":
        return TrendingUp;
      default:
        return Clock;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-orange-200 bg-orange-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const getIconColor = (type, priority) => {
    if (priority === "high") return "text-red-600";
    if (priority === "medium") return "text-orange-600";

    switch (type) {
      case "completion":
        return "text-green-600";
      case "skill":
        return "text-purple-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        Recent Activity
      </h3>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => {
            const IconComponent = getIcon(activity.type);
            return (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${getPriorityColor(activity.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <IconComponent
                    className={`w-5 h-5 mt-0.5 ${getIconColor(activity.type, activity.priority)}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
        View all activity →
      </button>
    </div>
  );
};

// AI Explore Section Component
export const AIExploreSection = ({
  title,
  suggestions = [],
  color = "blue",
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
    indigo: "from-indigo-500 to-blue-500",
  };

  const cardColors = {
    blue: "border-blue-200 bg-blue-50 hover:bg-blue-100",
    green: "border-green-200 bg-green-50 hover:bg-green-100",
    purple: "border-purple-200 bg-purple-50 hover:bg-purple-100",
    indigo: "border-indigo-200 bg-indigo-50 hover:bg-indigo-100",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-8 h-8 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {suggestions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No suggestions available
          </p>
        ) : (
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${cardColors[color]}`}
            >
              <p className="text-sm font-medium text-gray-900">{suggestion}</p>
            </div>
          ))
        )}
      </div>

      <button
        className={`w-full mt-4 text-sm font-medium transition-colors text-${color}-600 hover:text-${color}-700`}
      >
        Explore more suggestions →
      </button>
    </div>
  );
};

// Hero Section Component
export const HeroSection = ({
  user,
  quickActions = [],
  gradientFrom,
  gradientTo,
}) => {
  const roleLabels = {
    employee: "Employee",
    pm: "Project Manager",
    hr: "HR Administrator",
    line_manager: "Line Manager",
    admin: "Administrator",
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div
      className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl p-8 text-white relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-6 -translate-x-6"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-3 border-white/30 bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user.name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {getGreeting()}, {user.name || "User"}!
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {roleLabels[user.role] || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <button className="flex items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 group w-full">
                <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">{action.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Metric Tile Component
export const MetricTile = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  subtitle,
  growth,
  children,
}) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
    red: "text-red-600 bg-red-50",
    indigo: "text-indigo-600 bg-indigo-50",
    yellow: "text-yellow-600 bg-yellow-50",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>

      {children || (
        <div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
          {growth && (
            <div className="text-sm text-green-600 font-medium mt-2">
              {growth}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Progress Ring Component
export const ProgressRing = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "blue",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colors = {
    blue: "#3B82F6",
    green: "#10B981",
    purple: "#8B5CF6",
    orange: "#F59E0B",
  };

  return (
    <div className="relative">
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{progress}%</span>
      </div>
    </div>
  );
};

// Project Card Component
export const ProjectCard = ({ project }) => {
  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{project.name}</h4>
        <span className="text-sm font-medium text-gray-600">
          {project.progress || 0}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress || 0)}`}
          style={{ width: `${project.progress || 0}%` }}
        ></div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="w-4 h-4" />
        <span>Due {formatDate(project.dueDate)}</span>
      </div>
    </div>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = 24 }) => (
  <div className="flex items-center justify-center">
    <div
      className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
      style={{ width: size, height: size }}
    ></div>
  </div>
);

// Error Display Component
export const ErrorDisplay = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
    <p className="text-red-800 font-medium">{message}</p>
  </div>
);
