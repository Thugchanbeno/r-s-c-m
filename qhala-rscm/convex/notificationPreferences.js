import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

async function getActor(ctx, email) {
  if (!email) throw new Error("Unauthorized: missing email");
  const actor = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  if (!actor) throw new Error("User not found");
  return actor;
}

/**
 * Role-based default notification preferences
 */
const ROLE_BASED_DEFAULTS = {
  employee: {
    // Category preferences
    user_management: false,
    skills_verification: true,
    projects: true,
    resources: true,
    approvals: true,
    tasks: true,
    system: false,
    analytics: false,

    // Priority preferences
    critical_only: false,
    high_and_above: false,
    medium_and_above: true,
    all_priorities: false,

    // Specific type overrides
    type_preferences: {
      // User management - only own account
      user_role_changed: true,
      user_deactivated: true,
      user_profile_incomplete: true,

      // Skills - all enabled
      skill_verification_approved: true,
      skill_verification_rejected: true,
      skill_verification_expired: true,
      skill_in_demand: true,
      new_skill_opportunity: true,

      // Projects - team related only
      project_team_added: true,
      project_team_removed: true,
      project_deadline_approaching: true,
      project_overdue: true,
      project_skills_matched: true,

      // Resources - their allocations
      allocation_created: true,
      allocation_updated: true,
      allocation_cancelled: true,
      allocation_approaching_capacity: true,

      // Leave/overtime status
      leave_request_approved: true,
      leave_request_rejected: true,
      overtime_request_approved: true,
      overtime_request_rejected: true,
      leave_balance_low: true,
      leave_expiring_soon: true,
      covering_assignment: true,

      // Tasks
      task_assigned: true,
      task_deadline_approaching: true,
      task_overdue: true,
      task_commented: true,
      task_reassigned: true,

      // System - only critical
      system_alert: true,
      security_alert: true,
      account_security: true,
    },
  },

  line_manager: {
    // Category preferences
    user_management: true,
    skills_verification: true,
    projects: true,
    resources: true,
    approvals: true,
    tasks: true,
    system: false,
    analytics: true,

    // Priority preferences
    critical_only: false,
    high_and_above: true,
    medium_and_above: false,
    all_priorities: false,

    // Specific type overrides
    type_preferences: {
      // Skills verification from their reports
      skill_verification_requested: true,

      // Resource requests requiring approval
      resource_request_pending_lm: true,

      // Leave requests from their reports
      leave_request_pending_lm: true,

      // Team capacity alerts
      allocation_conflict: true,
      allocation_underutilized: true,
      allocation_approaching_capacity: true,

      // Team task deadlines
      task_deadline_approaching: true,
      task_overdue: true,

      // System alerts
      system_alert: true,
      security_alert: true,

      // Team analytics
      capacity_alert: true,
      utilization_alert: true,
    },
  },

  pm: {
    // Category preferences
    user_management: false,
    skills_verification: false,
    projects: true,
    resources: true,
    approvals: true,
    tasks: true,
    system: false,
    analytics: true,

    // Priority preferences
    critical_only: false,
    high_and_above: true,
    medium_and_above: false,
    all_priorities: false,

    // Specific type overrides
    type_preferences: {
      // Project management
      project_deadline_approaching: true,
      project_overdue: true,

      // Resource requests
      resource_request_lm_approved: true,
      resource_request_lm_rejected: true,
      resource_request_hr_approved: true,
      resource_request_hr_rejected: true,

      // Leave requests affecting projects
      leave_request_pending_pm: true,

      // Team capacity
      allocation_conflict: true,
      capacity_alert: true,
      utilization_alert: true,

      // Task management
      task_deadline_approaching: true,
      task_overdue: true,

      // System alerts
      system_alert: true,
    },
  },

  hr: {
    // Category preferences
    user_management: true,
    skills_verification: true,
    projects: false,
    resources: true,
    approvals: true,
    tasks: false,
    system: true,
    analytics: true,

    // Priority preferences
    critical_only: false,
    high_and_above: false,
    medium_and_above: true,
    all_priorities: false,

    // Specific type overrides
    type_preferences: {
      // User management
      user_role_changed: true,
      user_deactivated: true,
      user_reactivated: true,

      // Skills compliance
      skill_verification_expired: true,
      skills_profile_incomplete: true,

      // Resource management
      resource_request_pending_hr: true,
      allocation_conflict: true,

      // Leave management
      leave_request_pending_hr: true,
      leave_balance_low: true,
      leave_expiring_soon: true,

      // Analytics
      analytics_alert: true,
      capacity_alert: true,
      skills_gap_alert: true,
      utilization_alert: true,

      // System
      system_alert: true,
      security_alert: true,
      data_export_ready: true,
    },
  },

  admin: {
    // Category preferences - all enabled
    user_management: true,
    skills_verification: true,
    projects: true,
    resources: true,
    approvals: true,
    tasks: true,
    system: true,
    analytics: true,

    // Priority preferences
    critical_only: false,
    high_and_above: false,
    medium_and_above: false,
    all_priorities: true,

    // Specific type overrides - most enabled
    type_preferences: {
      // System administration
      system_maintenance: true,
      system_update: true,
      system_alert: true,
      security_alert: true,
      account_security: true,
      data_export_ready: true,

      // Critical business alerts
      allocation_conflict: true,
      analytics_alert: true,
      capacity_alert: true,
      skills_gap_alert: true,
      utilization_alert: true,

      // User management
      user_role_changed: true,
      user_deactivated: true,
      user_reactivated: true,

      // All approvals for oversight
      resource_request_pending_hr: true,
      leave_request_pending_hr: true,

      // Report generation
      report_generated: true,
      report_failed: true,
    },
  },
};

/**
 * Get user's notification preferences with role-based defaults
 */
export const getPreferences = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    // Get role-based defaults
    const roleDefaults =
      ROLE_BASED_DEFAULTS[user.role] || ROLE_BASED_DEFAULTS.employee;

    // Merge with user's custom preferences
    const preferences = {
      ...roleDefaults,
      ...(user.notificationPreferences || {}),
    };

    return {
      preferences,
      role: user.role,
      isCustomized: !!user.notificationPreferences,
    };
  },
});

/**
 * Update user's notification preferences
 */
export const updatePreferences = mutation({
  args: {
    email: v.string(),
    preferences: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    await ctx.db.patch(user._id, {
      notificationPreferences: args.preferences,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Reset preferences to role-based defaults
 */
export const resetToDefaults = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);
    const roleDefaults =
      ROLE_BASED_DEFAULTS[user.role] || ROLE_BASED_DEFAULTS.employee;

    await ctx.db.patch(user._id, {
      notificationPreferences: roleDefaults,
      updatedAt: Date.now(),
    });

    return { success: true, preferences: roleDefaults };
  },
});

/**
 * Check if user should receive a specific notification type
 */
export const shouldReceiveNotification = query({
  args: {
    email: v.string(),
    notificationType: v.string(),
    priority: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);
    const roleDefaults =
      ROLE_BASED_DEFAULTS[user.role] || ROLE_BASED_DEFAULTS.employee;
    const userPreferences = user.notificationPreferences || {};

    // Merge preferences
    const preferences = { ...roleDefaults, ...userPreferences };

    // Check category preference first
    if (args.category && preferences[args.category] === false) {
      return false;
    }

    // Check priority preferences
    if (args.priority) {
      if (preferences.critical_only && args.priority !== "critical") {
        return false;
      }
      if (
        preferences.high_and_above &&
        !["critical", "high"].includes(args.priority)
      ) {
        return false;
      }
      if (
        preferences.medium_and_above &&
        !["critical", "high", "medium"].includes(args.priority)
      ) {
        return false;
      }
    }

    // Check specific type preference
    if (
      preferences.type_preferences &&
      preferences.type_preferences[args.notificationType] !== undefined
    ) {
      return preferences.type_preferences[args.notificationType];
    }

    // Default to category preference
    return args.category ? preferences[args.category] !== false : true;
  },
});

/**
 * Get notification preferences summary for all roles (admin function)
 */
export const getPreferencesSummary = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    // Only allow admins to see this summary
    if (user.role !== "admin") {
      throw new Error("Unauthorized: admin access required");
    }

    const allUsers = await ctx.db.query("users").collect();
    const summary = {
      total: allUsers.length,
      byRole: {},
      customizedCount: 0,
      usingDefaults: 0,
    };

    for (const u of allUsers) {
      // Count by role
      summary.byRole[u.role] = (summary.byRole[u.role] || 0) + 1;

      // Count customization
      if (u.notificationPreferences) {
        summary.customizedCount++;
      } else {
        summary.usingDefaults++;
      }
    }

    return summary;
  },
});

/**
 * Bulk update preferences for users of a specific role
 */
export const bulkUpdateByRole = mutation({
  args: {
    email: v.string(),
    targetRole: v.string(),
    preferences: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await getActor(ctx, args.email);

    // Only allow admins to bulk update
    if (user.role !== "admin") {
      throw new Error("Unauthorized: admin access required");
    }

    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), args.targetRole))
      .collect();

    let updatedCount = 0;
    for (const u of users) {
      await ctx.db.patch(u._id, {
        notificationPreferences: args.preferences,
        updatedAt: Date.now(),
      });
      updatedCount++;
    }

    return { success: true, updatedCount };
  },
});
