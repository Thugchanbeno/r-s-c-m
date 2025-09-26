"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import Image from "next/image";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  User,
  FileText,
  Settings,
  TrendingUp,
  Calendar,
  Users,
  Briefcase,
  Shield,
  ExternalLink,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Clock,
  CheckCheck,
  Filter,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useEnhancedNotifications } from "@/lib/hooks/useEnhancedNotifications";

// Icon mapping for categories
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

// Priority colors and icons
const PRIORITY_CONFIG = {
  critical: {
    color: "rgb(239 68 68)", // red-500
    bgColor: "rgb(254 242 242)", // red-50
    icon: AlertCircle,
    textColor: "rgb(127 29 29)", // red-900
    badgeVariant: "destructive",
  },
  high: {
    color: "rgb(245 158 11)", // amber-500
    bgColor: "rgb(255 251 235)", // amber-50
    icon: AlertTriangle,
    textColor: "rgb(146 64 14)", // amber-900
    badgeVariant: "secondary",
  },
  medium: {
    color: "rgb(59 130 246)", // blue-500
    bgColor: "rgb(239 246 255)", // blue-50
    icon: Info,
    textColor: "rgb(30 58 138)", // blue-900
    badgeVariant: "outline",
  },
  low: {
    color: "rgb(107 114 128)", // gray-500
    bgColor: "rgb(249 250 251)", // gray-50
    icon: Info,
    textColor: "rgb(55 65 81)", // gray-700
    badgeVariant: "secondary",
  },
};

// Category colors
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

// Helper function to generate user avatar fallback
const getUserAvatarFallback = (actionUserId, contextData) => {
  let userName = null;
  if (contextData?.actionUserName) {
    userName = contextData.actionUserName;
  } else if (contextData?.pmName) {
    userName = contextData.pmName;
  } else if (contextData?.updatedByName) {
    userName = contextData.updatedByName;
  } else if (contextData?.verifierName) {
    userName = contextData.verifierName;
  }
  
  if (userName) {
    const names = userName.split(" ");
    return names.map(name => name[0]).join("").toUpperCase();
  }
  return "S"; // System default
};

// Helper function to get user name
const getUserName = (notification) => {
  // Check various contextData fields for user name
  if (notification.contextData?.actionUserName) {
    return notification.contextData.actionUserName;
  }
  if (notification.contextData?.pmName) {
    return notification.contextData.pmName;
  }
  if (notification.contextData?.updatedByName) {
    return notification.contextData.updatedByName;
  }
  if (notification.contextData?.verifierName) {
    return notification.contextData.verifierName;
  }
  if (notification.actionUserRole === "system") {
    return "System";
  }
  return "Unknown User";
};

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onMarkAsUnread, 
  onArchive, 
  onDelete 
}) {
  const CategoryIcon = CATEGORY_ICONS[notification.category] || Info;
  const priorityConfig = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.medium;
  const categoryColor = CATEGORY_COLORS[notification.category] || "rgb(107 114 128)";
  

  const handleMarkAsRead = useCallback(() => {
    if (!notification.isRead) {
      onMarkAsRead([notification._id]);
    }
  }, [notification._id, notification.isRead, onMarkAsRead]);

  const handleMarkAsUnread = useCallback(() => {
    if (notification.isRead) {
      onMarkAsUnread(notification._id);
    }
  }, [notification._id, notification.isRead, onMarkAsUnread]);

  // Check if notification has a comprehensive message that doesn't need header construction
  const hasComprehensiveMessage = (notification) => {
    const comprehensiveTypes = [
      'project_status_changed',
      'system_alert',
      'report_generated',
      'report_failed'
    ];
    return comprehensiveTypes.includes(notification.type) && notification.message;
  };

  const formatNotificationAction = (notification) => {
    const actionMap = {
      user_role_changed: "changed your role",
      skill_verification_requested: "requested skill verification",
      skill_verification_approved: "approved your skill",
      skill_verification_rejected: "rejected your skill verification",
      project_team_added: "added you to",
      project_team_removed: "removed you from",
      project_deadline_approaching: "deadline approaching for",
      project_status_changed: "created new project",
      allocation_created: "allocated you to",
      allocation_updated: "updated your allocation for",
      resource_request_pending_lm: "needs your approval",
      leave_request_approved: "approved your leave request",
      leave_request_rejected: "rejected your leave request",
      task_assigned: "assigned you a task in",
      system_alert: "sent a system alert",
    };
    
    return actionMap[notification.type] || "sent you a notification";
  };

  return (
    <div className="w-full py-3 first:pt-0 last:pb-0">
      <div className="flex gap-3">
        <div className="relative flex-shrink-0">
          {notification.actionUserId ? (
            <div className="h-10 w-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {notification.contextData?.actionUserAvatar && notification.contextData.actionUserAvatar.trim() !== '' ? (
                <Image
                  src={notification.contextData.actionUserAvatar}
                  alt={`${getUserName(notification)}'s profile picture`}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getUserAvatarFallback(notification.actionUserId, notification.contextData)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="flex-shrink-0 p-2.5 rounded-full h-10 w-10 flex items-center justify-center"
              style={{ backgroundColor: `${categoryColor}20` }}
            >
              <CategoryIcon 
                className="h-4 w-4" 
                style={{ color: categoryColor }}
              />
            </div>
          )}
          
          <div
            className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800"
            style={{ backgroundColor: priorityConfig.color }}
          />
        </div>

        <div className="flex flex-1 flex-col min-w-0">
          <div className="w-full">
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm flex-1 min-w-0">
                  {hasComprehensiveMessage(notification) ? (
                    <div className="text-[rgb(var(--foreground))] break-words">{notification.message}</div>
                  ) : (
                    <div className="break-words">
                      <span className="font-medium">{getUserName(notification)}</span>
                      <span className="text-muted-foreground ml-1">
                        {formatNotificationAction(notification)}
                      </span>
                      {notification.contextData?.projectName && (
                        <span className="font-medium ml-1">"{notification.contextData.projectName}"</span>
                      )}
                      {notification.contextData?.taskTitle && (
                        <span className="font-medium ml-1">"{notification.contextData.taskTitle}"</span>
                      )}
                      {notification.contextData?.department && (
                        <span className="text-muted-foreground ml-1">in {notification.contextData.department}</span>
                      )}
                    </div>
                  )}
                </div>
                {!notification.isRead && (
                  <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <div>
                  {format(new Date(notification.createdAt), "EEE h:mm a")}
                </div>
                <div>
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>

          {notification.message && !hasComprehensiveMessage(notification) && (
            <div className="rounded-lg bg-muted p-2.5 text-sm tracking-[-0.006em]">
              {notification.message}
            </div>
          )}

          {notification.contextData?.fileName && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
              <svg
                width="34"
                height="34"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative shrink-0"
              >
                <path
                  d="M30 39.25H10C7.10051 39.25 4.75 36.8995 4.75 34V6C4.75 3.10051 7.10051 0.75 10 0.75H20.5147C21.9071 0.75 23.2425 1.30312 24.227 2.28769L33.7123 11.773C34.6969 12.7575 35.25 14.0929 35.25 15.4853V34C35.25 36.8995 32.8995 39.25 30 39.25Z"
                  className="fill-white stroke-border dark:fill-card/70"
                  strokeWidth="1.5"
                />
                <path
                  d="M23 1V9C23 11.2091 24.7909 13 27 13H35"
                  className="stroke-border dark:fill-muted-foreground"
                  strokeWidth="1.5"
                />
                <foreignObject x="0" y="0" width="40" height="40">
                  <div className="absolute bottom-1.5 left-0 flex h-4 items-center rounded bg-primary px-[3px] py-0.5 text-[11px] leading-none font-semibold text-white dark:bg-muted">
                    PDF
                  </div>
                </foreignObject>
              </svg>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {notification.contextData.fileName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {notification.contextData.fileSize && `${notification.contextData.fileSize} • `}
                  Document
                </div>
              </div>
              <Button variant="ghost" size="icon" className="size-8">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}

          {notification.requiresAction && !notification.actionCompleted && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => {
                  // Handle reject action
                }}
              >
                Decline
              </Button>
              <Button 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => {
                  // Handle approve action
                }}
              >
                Accept
              </Button>
            </div>
          )}

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.isRead ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleMarkAsRead}
              >
                <Eye className="h-3 w-3 mr-1" />
                Read
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleMarkAsUnread}
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Unread
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onArchive([notification._id])}
            >
              <Archive className="h-3 w-3 mr-1" />
              Archive
            </Button>

            {notification.actionUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => window.open(notification.actionUrl, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const EnhancedNotificationDropdown = ({ 
  className, 
  onClose, 
  onMarkAllReadSuccess, 
  onNotificationRead 
}) => {
  const [activeTab, setActiveTab] = useState("all");
  
  const {
    notifications,
    unreadCount,
    summaryStats,
    loading,
    handleMarkAsRead,
    handleMarkAsUnread,
    handleArchive,
    handleDelete,
    handleMarkAllAsRead,
  } = useEnhancedNotifications();

  // Wrapped handlers to include callbacks
  const wrappedMarkAllAsRead = useCallback(async () => {
    await handleMarkAllAsRead();
    onMarkAllReadSuccess?.();
  }, [handleMarkAllAsRead, onMarkAllReadSuccess]);

  const wrappedMarkAsRead = useCallback(async (notificationIds) => {
    await handleMarkAsRead(notificationIds);
    onNotificationRead?.(unreadCount - (Array.isArray(notificationIds) ? notificationIds.length : 1));
  }, [handleMarkAsRead, onNotificationRead, unreadCount]);

  // Calculate counts for tabs
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const actionRequiredNotifications = notifications.filter(n => n.requiresAction && !n.actionCompleted);
  const criticalNotifications = notifications.filter(n => n.priority === 'critical');

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return unreadNotifications;
      case "action_required":
        return actionRequiredNotifications;
      case "critical":
        return criticalNotifications;
      default:
        return notifications.slice(0, 10); // Limit to 10 for dropdown
    }
  };

  const filteredNotifications = getFilteredNotifications();

  if (loading) {
    return (
      <Card className={cn("flex w-full max-w-[520px] flex-col gap-6 p-4 shadow-none md:p-8", className)}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("flex w-full flex-col gap-4 p-4 shadow-none border-0", className)}>
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <h3 className="text-base leading-none font-semibold tracking-[-0.006em]">
            Your notifications
          </h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                className="size-8" 
                variant="ghost" 
                size="icon"
                onClick={wrappedMarkAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="size-4.5 text-muted-foreground" />
              </Button>
            )}
            <Button className="size-8" variant="ghost" size="icon">
              <Filter className="size-4.5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-col justify-start"
        >
          <div className="flex items-center justify-between">
            <TabsList className="**:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 [&_button]:gap-1.5">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary">{notifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread 
                <Badge variant="secondary">{unreadNotifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="action_required">
                Actions 
                <Badge variant="secondary">{actionRequiredNotifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="critical">
                Critical 
                <Badge variant="destructive">{criticalNotifications.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </CardHeader>

      <CardContent className="h-full p-0">
        <div className="space-y-0 divide-y divide-dashed divide-border max-h-[60vh] overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div key={notification._id} className="group">
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={wrappedMarkAsRead}
                  onMarkAsUnread={handleMarkAsUnread}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2.5 py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="m13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <p className="text-sm font-medium tracking-[-0.006em] text-muted-foreground">
                {activeTab === "all" 
                  ? "No notifications yet." 
                  : `No ${activeTab.replace("_", " ")} notifications.`
                }
              </p>
            </div>
          )}
        </div>
        {notifications.length > 10 && (
          <div className="mt-4 pt-4 border-t border-dashed border-border text-center">
            <Button variant="outline" size="sm" asChild>
              <a href="/notifications">
                View all {notifications.length} notifications
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedNotificationDropdown;