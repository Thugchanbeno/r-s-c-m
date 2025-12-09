import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Notification Type to Category Mapping
 */
const TYPE_TO_CATEGORY = {
  // User Management
  "user_role_changed": "user_management",
  "user_deactivated": "user_management", 
  "user_reactivated": "user_management",
  "user_profile_incomplete": "user_management",
  
  // Skills & Verification
  "skill_verification_requested": "skills_verification",
  "skill_verification_approved": "skills_verification",
  "skill_verification_rejected": "skills_verification", 
  "skill_verification_expired": "skills_verification",
  "skill_in_demand": "skills_verification",
  "new_skill_opportunity": "skills_verification",
  "skills_profile_incomplete": "skills_verification",
  
  // Projects
  "project_deadline_approaching": "projects",
  "project_overdue": "projects",
  "project_team_added": "projects",
  "project_team_removed": "projects",
  "project_skills_matched": "projects",
  "project_cancelled": "projects",
  "project_status_changed": "projects",
  
  // Resources
  "allocation_created": "resources",
  "allocation_updated": "resources",
  "allocation_cancelled": "resources",
  "allocation_conflict": "resources",
  "allocation_underutilized": "resources",
  "allocation_approaching_capacity": "resources",
  
  // Approvals
  "resource_request_pending_lm": "approvals",
  "resource_request_pending_hr": "approvals",
  "resource_request_lm_approved": "approvals",
  "resource_request_lm_rejected": "approvals",
  "resource_request_hr_approved": "approvals",
  "resource_request_hr_rejected": "approvals",
  "resource_request_expired": "approvals",
  "leave_request_pending_lm": "approvals",
  "leave_request_pending_pm": "approvals", 
  "leave_request_pending_hr": "approvals",
  "leave_request_approved": "approvals",
  "leave_request_rejected": "approvals",
  "overtime_request_approved": "approvals",
  "overtime_request_rejected": "approvals",
  "leave_balance_low": "approvals",
  "leave_expiring_soon": "approvals",
  "covering_assignment": "approvals",
  
  // Tasks
  "task_assigned": "tasks",
  "task_deadline_approaching": "tasks",
  "task_overdue": "tasks", 
  "task_commented": "tasks",
  "task_reassigned": "tasks",
  
  // CV/Profile
  "cv_processed": "user_management",
  "cv_processing_failed": "user_management",
  "profile_completeness_low": "user_management",
  "profile_recommendation": "user_management",
  
  // Analytics
  "report_generated": "analytics",
  "report_failed": "analytics",
  "analytics_alert": "analytics",
  "capacity_alert": "analytics", 
  "skills_gap_alert": "analytics",
  "utilization_alert": "analytics",
  
  // System
  "system_maintenance": "system",
  "system_update": "system",
  "system_alert": "system",
  "data_export_ready": "system",
  "security_alert": "system",
  "account_security": "system"
};

/**
 * Default Priority Mapping
 */
const TYPE_TO_PRIORITY = {
  // Critical - Security, system issues, urgent approvals
  "system_alert": "critical",
  "security_alert": "critical", 
  "account_security": "critical",
  "allocation_conflict": "critical",
  
  // High - Deadlines, important approvals, account changes
  "user_role_changed": "high",
  "user_deactivated": "high",
  "project_deadline_approaching": "high",
  "project_overdue": "high",
  "task_deadline_approaching": "high",
  "task_overdue": "high",
  "resource_request_pending_lm": "high",
  "resource_request_pending_hr": "high", 
  "leave_request_pending_lm": "high",
  "leave_request_pending_pm": "high",
  "leave_request_pending_hr": "high",
  "leave_balance_low": "high",
  "leave_expiring_soon": "high",
  
  // Medium - Regular updates, assignments, verification results
  "skill_verification_requested": "medium",
  "skill_verification_approved": "medium",
  "skill_verification_rejected": "medium",
  "project_team_added": "medium",
  "project_team_removed": "medium", 
  "project_cancelled": "medium",
  "allocation_created": "medium",
  "allocation_updated": "medium",
  "allocation_cancelled": "medium",
  "task_assigned": "medium",
  "task_reassigned": "medium",
  "leave_request_approved": "medium",
  "leave_request_rejected": "medium",
  "overtime_request_approved": "medium",
  "overtime_request_rejected": "medium",
  "covering_assignment": "medium",
  "report_generated": "medium",
  "report_failed": "medium",
  
  // Low - Recommendations, tips, system updates
  "user_profile_incomplete": "low",
  "skills_profile_incomplete": "low",
  "skill_in_demand": "low", 
  "new_skill_opportunity": "low",
  "project_skills_matched": "low",
  "allocation_underutilized": "low",
  "allocation_approaching_capacity": "low",
  "skill_verification_expired": "low",
  "task_commented": "low",
  "cv_processed": "low",
  "cv_processing_failed": "low", 
  "profile_completeness_low": "low",
  "profile_recommendation": "low",
  "analytics_alert": "low",
  "capacity_alert": "low",
  "skills_gap_alert": "low",
  "utilization_alert": "low",
  "system_maintenance": "low",
  "system_update": "low",
  "data_export_ready": "low"
};

/**
 * Create a notification with standardized structure
 */
export const createNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.optional(v.string()),
    message: v.string(),
    link: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    requiresAction: v.optional(v.boolean()),
    expiresAt: v.optional(v.number()),
    relatedResourceId: v.optional(v.string()),
    relatedResourceType: v.optional(v.string()),
    actionUserId: v.optional(v.id("users")),
    actionUserRole: v.optional(v.string()),
    contextData: v.optional(v.any()),
    priority: v.optional(v.string()), // Override default priority if needed
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Auto-determine category from type
    const category = TYPE_TO_CATEGORY[args.type] || "system";
    
    // Auto-determine priority from type (can be overridden)
    const priority = args.priority || TYPE_TO_PRIORITY[args.type] || "medium";
    
    const notification = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      category,
      priority,
      title: args.title,
      message: args.message,
      link: args.link,
      actionUrl: args.actionUrl,
      isRead: false,
      requiresAction: args.requiresAction || false,
      actionCompleted: false,
      expiresAt: args.expiresAt,
      relatedResourceId: args.relatedResourceId,
      relatedResourceType: args.relatedResourceType,
      actionUserId: args.actionUserId,
      actionUserRole: args.actionUserRole,
      contextData: args.contextData,
      createdAt: now,
    });
    
    return notification;
  },
});

/**
 * Create notifications for multiple users (bulk operation)
 */
export const createBulkNotifications = internalMutation({
  args: {
    userIds: v.array(v.id("users")),
    type: v.string(),
    title: v.optional(v.string()),
    message: v.string(),
    link: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    requiresAction: v.optional(v.boolean()),
    expiresAt: v.optional(v.number()),
    relatedResourceId: v.optional(v.string()),
    relatedResourceType: v.optional(v.string()),
    actionUserId: v.optional(v.id("users")),
    actionUserRole: v.optional(v.string()),
    contextData: v.optional(v.any()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notifications = [];
    
    for (const userId of args.userIds) {
      const notification = await createNotification(ctx, {
        userId,
        type: args.type,
        title: args.title,
        message: args.message,
        link: args.link,
        actionUrl: args.actionUrl,
        requiresAction: args.requiresAction,
        expiresAt: args.expiresAt,
        relatedResourceId: args.relatedResourceId,
        relatedResourceType: args.relatedResourceType,
        actionUserId: args.actionUserId,
        actionUserRole: args.actionUserRole,
        contextData: args.contextData,
        priority: args.priority,
      });
      notifications.push(notification);
    }
    
    return notifications;
  },
});

/**
 * Helper to find users who should receive notifications for specific entities
 */
export const findNotificationRecipients = internalQuery({
  args: {
    type: v.string(),
    relatedResourceId: v.optional(v.string()),
    relatedResourceType: v.optional(v.string()),
    actionUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const recipients = [];
    
    try {
      switch (args.type) {
        case "skill_verification_requested":
          // Find line manager of the user who submitted the request
          if (args.relatedResourceType === "userSkill" && args.relatedResourceId) {
            const userSkill = await ctx.db.get(args.relatedResourceId);
            if (userSkill) {
              const user = await ctx.db.get(userSkill.userId);
              if (user?.lineManagerId) {
                recipients.push(user.lineManagerId);
              }
            }
          }
          break;
          
        case "task_assigned":
        case "task_completed":
          // Find project manager and line manager
          if (args.relatedResourceType === "task" && args.relatedResourceId) {
            const task = await ctx.db.get(args.relatedResourceId);
            if (task) {
              const project = await ctx.db.get(task.projectId);
              if (project?.pmId) recipients.push(project.pmId);
              
              if (task.assignedUserId) {
                const assignedUser = await ctx.db.get(task.assignedUserId);
                if (assignedUser?.lineManagerId) {
                  recipients.push(assignedUser.lineManagerId);
                }
              }
            }
          }
          break;
          
        case "project_status_changed":
        case "project_team_added":
          // Find all team members and stakeholders
          if (args.relatedResourceType === "project" && args.relatedResourceId) {
            const project = await ctx.db.get(args.relatedResourceId);
            if (project) {
              // Add project manager
              if (project.pmId) recipients.push(project.pmId);
              
              // Find allocated team members
              const allocations = await ctx.db
                .query("allocations")
                .withIndex("by_project", (q) => q.eq("projectId", args.relatedResourceId))
                .filter((q) => q.eq(q.field("status"), "active"))
                .collect();
              
              allocations.forEach(allocation => {
                if (allocation.userId) recipients.push(allocation.userId);
              });
            }
          }
          break;
          
        case "allocation_created":
        case "allocation_updated":
        case "allocation_cancelled":
          // Find user, PM, and line manager
          if (args.relatedResourceType === "allocation" && args.relatedResourceId) {
            const allocation = await ctx.db.get(args.relatedResourceId);
            if (allocation) {
              recipients.push(allocation.userId);
              
              const project = await ctx.db.get(allocation.projectId);
              if (project?.pmId) recipients.push(project.pmId);
              
              const user = await ctx.db.get(allocation.userId);
              if (user?.lineManagerId) recipients.push(user.lineManagerId);
            }
          }
          break;
          
        case "leave_request_pending_lm":
        case "leave_request_pending_pm":
        case "leave_request_pending_hr":
        case "overtime_request_approved":
        case "overtime_request_rejected":
          // Find appropriate approvers
          if (args.relatedResourceType === "workRequest" && args.relatedResourceId) {
            const request = await ctx.db.get(args.relatedResourceId);
            if (request) {
              const user = await ctx.db.get(request.userId);
              
              // Line manager approval stage
              if (args.type.includes("pending_lm") && user?.lineManagerId) {
                recipients.push(user.lineManagerId);
              }
              
              // PM approval stage - find PMs
              if (args.type.includes("pending_pm")) {
                const pms = await ctx.db
                  .query("users")
                  .filter((q) => q.eq(q.field("role"), "pm"))
                  .collect();
                pms.forEach(pm => recipients.push(pm._id));
              }
              
              // HR approval stage - find HR users
              if (args.type.includes("pending_hr")) {
                const hrUsers = await ctx.db
                  .query("users")
                  .filter((q) => q.or(
                    q.eq(q.field("role"), "hr"),
                    q.eq(q.field("role"), "admin")
                  ))
                  .collect();
                hrUsers.forEach(hr => recipients.push(hr._id));
              }
            }
          }
          break;
          
        case "user_role_changed":
        case "user_profile_incomplete":
          // Find HR and admin users
          const hrAndAdmins = await ctx.db
            .query("users")
            .filter((q) => q.or(
              q.eq(q.field("role"), "hr"),
              q.eq(q.field("role"), "admin")
            ))
            .collect();
          hrAndAdmins.forEach(user => recipients.push(user._id));
          break;
          
        default:
          // For unhandled types, return empty array
          break;
      }
      
      // Remove duplicates and exclude action user
      const uniqueRecipients = [...new Set(recipients)]
        .filter(id => args.actionUserId ? id !== args.actionUserId : true);
      
      return uniqueRecipients;
      
    } catch (error) {
      console.error("Error finding notification recipients:", error);
      return [];
    }
  },
});

/**
 * Mark notification action as completed
 */
export const markActionCompleted = internalMutation({
  args: {
    notificationId: v.id("notifications"),
    completedByUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.notificationId, {
      actionCompleted: true,
      actionCompletedAt: now,
      updatedAt: now,
    });
    
    return { success: true };
  },
});

/**
 * Clean up expired notifications
 */
export const cleanupExpiredNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_expires_at")
      .filter((q) => q.and(
        q.neq(q.field("expiresAt"), undefined),
        q.lt(q.field("expiresAt"), now)
      ))
      .collect();
    
    let deletedCount = 0;
    for (const notification of expiredNotifications) {
      await ctx.db.delete(notification._id);
      deletedCount++;
    }
    
    return { success: true, deletedCount };
  },
});

/**
 * Get notification statistics for admin dashboard
 */
export const getNotificationStats = internalQuery({
  args: {
    timeframe: v.optional(v.string()), // "today", "week", "month"
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let startTime;
    
    switch (args.timeframe) {
      case "today":
        startTime = new Date().setHours(0, 0, 0, 0);
        break;
      case "week":
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = 0;
    }
    
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_created_at")
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();
    
    const stats = {
      total: notifications.length,
      byCategory: {},
      byPriority: {},
      byType: {},
      unreadCount: 0,
      actionRequiredCount: 0,
    };
    
    for (const notification of notifications) {
      // By category
      stats.byCategory[notification.category] = 
        (stats.byCategory[notification.category] || 0) + 1;
      
      // By priority  
      stats.byPriority[notification.priority] = 
        (stats.byPriority[notification.priority] || 0) + 1;
      
      // By type
      stats.byType[notification.type] = 
        (stats.byType[notification.type] || 0) + 1;
      
      // Unread count
      if (!notification.isRead) {
        stats.unreadCount++;
      }
      
      // Action required count
      if (notification.requiresAction && !notification.actionCompleted) {
        stats.actionRequiredCount++;
      }
    }
    
    return stats;
  },
});