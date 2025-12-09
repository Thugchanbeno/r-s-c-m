"use client";

import React from "react";
import {
  Bell,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  FileText,
  Briefcase,
  Users,
  Calendar,
  Settings,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PRIORITY_COLORS = {
  critical: "rgb(239 68 68)", // red-500
  high: "rgb(245 158 11)",    // amber-500
  medium: "rgb(59 130 246)",  // blue-500
  low: "rgb(107 114 128)",    // gray-500
};

const CATEGORY_ICONS = {
  user_management: User,
  skills_verification: FileText,
  projects: Briefcase,
  resources: Users,
  approvals: CheckCircle2,
  tasks: Calendar,
  system: Settings,
  analytics: TrendingUp,
};

const CATEGORY_COLORS = {
  user_management: "rgb(168 85 247)", // purple-500
  skills_verification: "rgb(34 197 94)", // green-500
  projects: "rgb(59 130 246)", // blue-500
  resources: "rgb(245 158 11)", // amber-500
  approvals: "rgb(239 68 68)", // red-500
  tasks: "rgb(139 69 19)", // orange-700
  system: "rgb(107 114 128)", // gray-500
  analytics: "rgb(236 72 153)", // pink-500
};

const NotificationStats = ({ 
  summaryStats, 
  loading = false,
  showDetailed = true,
  className = "" 
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summaryStats) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-[rgb(var(--muted-foreground))]">
          No notification statistics available
        </p>
      </div>
    );
  }

  const priorityEntries = Object.entries(summaryStats.byPriority || {});
  const categoryEntries = Object.entries(summaryStats.byCategory || {});

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Notifications */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
                  Total
                </p>
                <p className="text-2xl font-bold">{summaryStats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-[rgb(var(--primary))]" />
            </div>
          </CardContent>
        </Card>
        
        {/* Unread Notifications */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
                  Unread
                </p>
                <p className="text-2xl font-bold text-[rgb(var(--primary))]">
                  {summaryStats.unread}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-[rgb(var(--primary))]" />
            </div>
          </CardContent>
        </Card>
        
        {/* Action Required */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
                  Action Required
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {summaryStats.actionRequired}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* Critical Priority */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
                  Critical Priority
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {summaryStats.byPriority?.critical || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      {showDetailed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority Breakdown */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">By Priority</h3>
              <div className="space-y-3">
                {priorityEntries.length > 0 ? (
                  priorityEntries
                    .sort(([a], [b]) => {
                      const order = { critical: 0, high: 1, medium: 2, low: 3 };
                      return order[a] - order[b];
                    })
                    .map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PRIORITY_COLORS[priority] }}
                          />
                          <span className="text-sm font-medium capitalize">
                            {priority}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${PRIORITY_COLORS[priority]}20`,
                            color: PRIORITY_COLORS[priority],
                          }}
                        >
                          {count}
                        </Badge>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    No priority data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">By Category</h3>
              <div className="space-y-3">
                {categoryEntries.length > 0 ? (
                  categoryEntries
                    .sort(([, a], [, b]) => b - a) // Sort by count descending
                    .slice(0, 6) // Show top 6 categories
                    .map(([category, count]) => {
                      const Icon = CATEGORY_ICONS[category] || Bell;
                      const color = CATEGORY_COLORS[category] || "rgb(107 114 128)";
                      
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon
                              className="w-4 h-4"
                              style={{ color }}
                            />
                            <span className="text-sm font-medium">
                              {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${color}20`,
                              color,
                            }}
                          >
                            {count}
                          </Badge>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    No category data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationStats;