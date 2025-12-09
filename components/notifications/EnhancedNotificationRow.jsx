"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
  User,
  FileText,
  Settings,
  TrendingUp,
  Calendar,
  Users,
  Briefcase,
  Shield,
  MoreHorizontal,
  ExternalLink,
  Archive,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
  },
  high: {
    color: "rgb(245 158 11)", // amber-500
    bgColor: "rgb(255 251 235)", // amber-50
    icon: AlertTriangle,
    textColor: "rgb(146 64 14)", // amber-900
  },
  medium: {
    color: "rgb(59 130 246)", // blue-500
    bgColor: "rgb(239 246 255)", // blue-50
    icon: Info,
    textColor: "rgb(30 58 138)", // blue-900
  },
  low: {
    color: "rgb(107 114 128)", // gray-500
    bgColor: "rgb(249 250 251)", // gray-50
    icon: Info,
    textColor: "rgb(55 65 81)", // gray-700
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

const EnhancedNotificationRow = ({
  notification,
  isSelected = false,
  onSelect,
  onClick,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete,
  onActionClick,
}) => {
  const CategoryIcon = CATEGORY_ICONS[notification.category] || Info;
  const priorityConfig = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.medium;
  const PriorityIcon = priorityConfig.icon;
  const categoryColor = CATEGORY_COLORS[notification.category] || "rgb(107 114 128)";

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const handleRowClick = (e) => {
    // Prevent row click when clicking on buttons or dropdown
    if (e.target.closest('button') || e.target.closest('[role="menuitem"]')) {
      return;
    }
    onClick?.(notification);
  };

  const formatNotificationTitle = (notification) => {
    if (notification.title) return notification.title;
    
    // Generate title based on type
    const typeToTitle = {
      user_role_changed: "Role Updated",
      skill_verification_requested: "Skill Verification Request",
      skill_verification_approved: "Skill Verified",
      skill_verification_rejected: "Skill Verification Rejected",
      project_team_added: "Added to Project",
      project_team_removed: "Removed from Project",
      project_deadline_approaching: "Project Deadline Soon",
      allocation_created: "New Allocation",
      resource_request_pending_lm: "Approval Required",
      leave_request_approved: "Leave Approved",
      task_assigned: "Task Assigned",
      system_alert: "System Alert",
    };
    
    return typeToTitle[notification.type] || "Notification";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative border-l-4 transition-all duration-200 hover:shadow-sm",
        notification.isRead 
          ? "bg-[rgb(var(--card))] border-l-gray-200" 
          : "bg-[rgb(var(--primary-accent-background))] border-l-[rgb(var(--primary))]",
        isSelected && "ring-2 ring-[rgb(var(--primary))] ring-opacity-50"
      )}
      onClick={handleRowClick}
    >
      {/* Priority indicator */}
      <div
        className="absolute top-0 right-0 w-2 h-full"
        style={{ backgroundColor: priorityConfig.color }}
      />

      <div className="flex items-start gap-4 p-4">
        {/* Selection checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.(notification._id);
            }}
            className="h-4 w-4 text-[rgb(var(--primary))] focus:ring-[rgb(var(--ring))] border-[rgb(var(--border))] rounded"
          />
        </div>

        {/* Category icon */}
        <div 
          className="flex-shrink-0 p-2 rounded-full"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          <CategoryIcon 
            className="h-5 w-5" 
            style={{ color: categoryColor }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h4 className={cn(
                "text-sm font-medium truncate",
                !notification.isRead 
                  ? "text-[rgb(var(--foreground))]" 
                  : "text-[rgb(var(--muted-foreground))]"
              )}>
                {formatNotificationTitle(notification)}
              </h4>
              
              {/* Badges */}
              <div className="flex items-center gap-2 mt-1">
                {/* Priority badge */}
                <Badge
                  variant="outline"
                  className="text-xs capitalize"
                  style={{
                    color: priorityConfig.textColor,
                    backgroundColor: priorityConfig.bgColor,
                    borderColor: priorityConfig.color,
                  }}
                >
                  <PriorityIcon className="h-3 w-3 mr-1" />
                  {notification.priority}
                </Badge>

                {/* Category badge */}
                <Badge
                  variant="outline"
                  className="text-xs capitalize"
                  style={{
                    color: categoryColor,
                    backgroundColor: `${categoryColor}10`,
                    borderColor: `${categoryColor}40`,
                  }}
                >
                  {notification.category.replace('_', ' ')}
                </Badge>

                {/* Action required badge */}
                {notification.requiresAction && !notification.actionCompleted && (
                  <Badge variant="destructive" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Action Required
                  </Badge>
                )}

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full" />
                )}
              </div>
            </div>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {notification.isRead ? (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsUnread?.(notification._id);
                    }}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Mark as unread
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead?.(notification._id);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                
                {notification.link && (
                  <DropdownMenuItem asChild>
                    <Link href={notification.link} className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View details
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive?.(notification._id);
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(notification._id);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Message */}
          <p className={cn(
            "text-sm mb-3",
            !notification.isRead 
              ? "text-[rgb(var(--foreground))]" 
              : "text-[rgb(var(--muted-foreground))]"
          )}>
            {notification.message}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
              <span>{timeAgo}</span>
              
              {notification.actionUserId && notification.actionUserRole && (
                <span className="capitalize">
                  By {notification.actionUserRole}
                </span>
              )}

              {notification.expiresAt && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="h-3 w-3" />
                  Expires {formatDistanceToNow(new Date(notification.expiresAt), { addSuffix: true })}
                </span>
              )}
            </div>

            {/* Action button */}
            {notification.requiresAction && !notification.actionCompleted && notification.actionUrl && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onActionClick?.(notification);
                }}
                className="ml-auto"
              >
                Take Action
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedNotificationRow;