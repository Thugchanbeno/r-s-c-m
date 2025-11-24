import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // USERS
  users: defineTable({
    name: v.string(),
    email: v.string(),
    authProviderId: v.optional(v.string()),
    department: v.optional(v.string()),
    annualLeaveEntitlement: v.optional(v.number()),
    annualLeaveUsed: v.optional(v.number()),
    leaveYearStartDate: v.optional(v.number()),
    compensatoryDaysBalance: v.optional(v.number()),
    role: v.union(
      v.literal("admin"),
      v.literal("pm"),
      v.literal("hr"),
      v.literal("employee"),
      v.literal("line_manager")
    ),
    avatarUrl: v.optional(v.string()),
    availabilityStatus: v.union(
      v.literal("available"),
      v.literal("unavailable"),
      v.literal("on_leave")
    ),
    function: v.optional(
      v.union(
        v.literal("q-trust"),
        v.literal("q-lab"),
        v.literal("consultants"),
        v.literal("qhala")
      )
    ),
    employeeType: v.optional(
      v.union(
        v.literal("permanent"),
        v.literal("consultancy"),
        v.literal("internship"),
        v.literal("temporary")
      )
    ),
    weeklyHours: v.optional(v.number()),
    lineManagerId: v.optional(v.id("users")),
    contractStartDate: v.optional(v.number()),
    contractEndDate: v.optional(v.number()),
    paymentTerms: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_department", ["department"])
    .index("by_function", ["function"])
    .index("by_line_manager", ["lineManagerId"])
    .index("by_availability", ["availabilityStatus"])
    .index("by_employee_type", ["employeeType"]),
  // SKILLS
  skills: defineTable({
    name: v.string(),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    aliases: v.optional(v.array(v.string())),
    embedding: v.optional(v.array(v.float64())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 384,
    }),

  // USER SKILLS
  userSkills: defineTable({
    userId: v.id("users"),
    skillId: v.id("skills"),
    proficiency: v.optional(v.number()),
    interestLevel: v.optional(v.number()),
    isCurrent: v.boolean(),
    isDesired: v.boolean(),
    proofDocuments: v.optional(
      v.array(
        v.object({
          documentStorageId: v.optional(v.id("_storage")),
          url: v.optional(v.string()),
          fileName: v.optional(v.string()),
          proofType: v.union(
            v.literal("cv"),
            v.literal("certification"),
            v.literal("badge"),
            v.literal("document"),
            v.literal("portfolio"),
            v.literal("link")
          ),
          issuer: v.optional(v.string()),
          verificationStatus: v.union(
            v.literal("pending"),
            v.literal("approved"),
            v.literal("rejected")
          ),
          verifiedBy: v.optional(v.id("users")),
          verifiedAt: v.optional(v.number()),
          rejectionReason: v.optional(v.string()),
          uploadedAt: v.number(),
        })
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_skill", ["skillId"])
    .index("by_user_skill", ["userId", "skillId"]),
  // PROJECTS
  projects: defineTable({
    name: v.string(),
    description: v.string(),
    department: v.optional(v.string()),
    function: v.optional(
      v.union(
        v.literal("q-trust"),
        v.literal("q-lab"),
        v.literal("consultants"),
        v.literal("qhala")
      )
    ),
    requiredSkills: v.optional(
      v.array(
        v.object({
          skillId: v.id("skills"),
          skillName: v.string(),
          proficiencyLevel: v.number(),
          isRequired: v.boolean(),
          category: v.optional(v.string()),
        })
      )
    ),
    nlpExtractedSkills: v.optional(v.array(v.string())),
    pmId: v.optional(v.id("users")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.union(
      v.literal("Planning"),
      v.literal("Active"),
      v.literal("On Hold"),
      v.literal("Completed"),
      v.literal("Cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_pm", ["pmId"])
    .index("by_status", ["status"])
    .index("by_department", ["department"])
    .index("by_function", ["function"]),
  // ALLOCATIONS
  allocations: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    allocationPercentage: v.number(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    role: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),
  // RESOURCE REQUESTS
  resourceRequests: defineTable({
    projectId: v.id("projects"),
    requestedUserId: v.id("users"),
    requestedByPmId: v.id("users"),
    requestedRole: v.string(),
    requestedPercentage: v.number(),
    requestedStartDate: v.optional(v.number()),
    requestedEndDate: v.optional(v.number()),
    status: v.union(
      v.literal("pending_lm"),
      v.literal("pending_hr"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    ),
    pmNotes: v.optional(v.string()),
    approverNotes: v.optional(v.string()),
    approvedBy: v.optional(v.id("users")),
    processedAt: v.optional(v.number()),

    lineManagerApproval: v.optional(
      v.object({
        status: v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected")
        ),
        approvedBy: v.optional(v.id("users")),
        reason: v.string(),
        approvedAt: v.optional(v.number()),
      })
    ),
    hrApproval: v.optional(
      v.object({
        status: v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected")
        ),
        approvedBy: v.optional(v.id("users")),
        reason: v.string(),
        approvedAt: v.optional(v.number()),
      })
    ),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_requested_user", ["requestedUserId"])
    .index("by_pm", ["requestedByPmId"])
    .index("by_status", ["status"])
    .index("by_pm_status", ["requestedByPmId", "status"]),
  // NOTIFICATIONS
  notifications: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    message: v.string(),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    isArchived: v.optional(v.boolean()),

    // Comprehensive notification types (persistent only)
    type: v.union(
      // User Management Domain (4 types)
      v.literal("user_role_changed"),
      v.literal("user_deactivated"),
      v.literal("user_reactivated"),
      v.literal("user_profile_incomplete"),

      // Skills & Verification Domain (7 types)
      v.literal("skill_verification_requested"),
      v.literal("skill_verification_approved"),
      v.literal("skill_verification_rejected"),
      v.literal("skill_verification_expired"),
      v.literal("skill_in_demand"),
      v.literal("new_skill_opportunity"),
      v.literal("skills_profile_incomplete"),

      // Projects Domain (7 types)
      v.literal("project_deadline_approaching"),
      v.literal("project_overdue"),
      v.literal("project_team_added"),
      v.literal("project_team_removed"),
      v.literal("project_skills_matched"),
      v.literal("project_cancelled"),
      v.literal("project_status_changed"),

      // Resources Domain (6 types)
      v.literal("allocation_created"),
      v.literal("allocation_updated"),
      v.literal("allocation_cancelled"),
      v.literal("allocation_conflict"),
      v.literal("allocation_underutilized"),
      v.literal("allocation_approaching_capacity"),

      // Approvals Domain (7 types)
      v.literal("resource_request_pending_lm"),
      v.literal("resource_request_pending_hr"),
      v.literal("resource_request_lm_approved"),
      v.literal("resource_request_lm_rejected"),
      v.literal("resource_request_hr_approved"),
      v.literal("resource_request_hr_rejected"),
      v.literal("resource_request_expired"),

      // Work Requests Domain (10 types)
      v.literal("leave_request_pending_lm"),
      v.literal("leave_request_pending_pm"),
      v.literal("leave_request_pending_hr"),
      v.literal("leave_request_approved"),
      v.literal("leave_request_rejected"),
      v.literal("overtime_request_approved"),
      v.literal("overtime_request_rejected"),
      v.literal("leave_balance_low"),
      v.literal("leave_expiring_soon"),
      v.literal("covering_assignment"),

      // Tasks Domain (5 types)
      v.literal("task_assigned"),
      v.literal("task_deadline_approaching"),
      v.literal("task_overdue"),
      v.literal("task_commented"),
      v.literal("task_reassigned"),

      // CV/Profile Domain (4 types)
      v.literal("cv_processed"),
      v.literal("cv_processing_failed"),
      v.literal("profile_completeness_low"),
      v.literal("profile_recommendation"),

      // Analytics Domain (6 types)
      v.literal("report_generated"),
      v.literal("report_failed"),
      v.literal("analytics_alert"),
      v.literal("capacity_alert"),
      v.literal("skills_gap_alert"),
      v.literal("utilization_alert"),

      // System Domain (6 types)
      v.literal("system_maintenance"),
      v.literal("system_update"),
      v.literal("system_alert"),
      v.literal("data_export_ready"),
      v.literal("security_alert"),
      v.literal("account_security"),

      // Legacy types for backward compatibility
      v.literal("new_request"),
      v.literal("request_approved"),
      v.literal("request_rejected"),
      v.literal("new_allocation"),
      v.literal("skill_verification"),
      v.literal("general_info")
    ),

    // Notification categorization for filtering
    category: v.union(
      v.literal("user_management"),
      v.literal("skills_verification"),
      v.literal("projects"),
      v.literal("resources"),
      v.literal("approvals"),
      v.literal("tasks"),
      v.literal("system"),
      v.literal("analytics")
    ),

    // Priority levels
    priority: v.union(
      v.literal("critical"), // Security, system down, urgent approvals
      v.literal("high"), // Deadlines, important approvals
      v.literal("medium"), // Regular updates, assignments
      v.literal("low") // Recommendations, tips
    ),

    // Enhanced relationship tracking
    relatedResourceId: v.optional(v.string()),
    relatedResourceType: v.optional(
      v.union(
        v.literal("project"),
        v.literal("user"),
        v.literal("resourceRequest"),
        v.literal("allocation"),
        v.literal("task"),
        v.literal("userSkill"),
        v.literal("workRequest"),
        v.literal("skill"),
        v.literal("cvCache"),
        v.literal("report")
      )
    ),

    // Who triggered this notification
    actionUserId: v.optional(v.id("users")),
    actionUserRole: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("hr"),
        v.literal("pm"),
        v.literal("line_manager"),
        v.literal("employee"),
        v.literal("system")
      )
    ),

    // Additional context data for rich notifications
    contextData: v.optional(v.any()),

    // For action-required notifications
    requiresAction: v.optional(v.boolean()),
    actionCompleted: v.optional(v.boolean()),
    actionCompletedAt: v.optional(v.number()),
    actionUrl: v.optional(v.string()), // Direct link to take action

    // Expiry for time-sensitive notifications
    expiresAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"])
    .index("by_user_category", ["userId", "category"])
    .index("by_user_priority", ["userId", "priority"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_requires_action", ["userId", "requiresAction"])
    .index("by_created_at", ["createdAt"])
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_action_user", ["actionUserId"])
    .index("by_expires_at", ["expiresAt"])
    .index("by_related_resource", ["relatedResourceType", "relatedResourceId"]),
  // CV CACHE
  cvCache: defineTable({
    fileName: v.string(),
    rawText: v.string(),
    extractedEntities: v.optional(v.any()),
    extractedSkills: v.array(
      v.object({
        id: v.optional(v.string()),
        name: v.string(),
        category: v.optional(v.string()),
        similarity: v.optional(v.number()),
      })
    ),
    prepopulatedData: v.optional(
      v.object({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        skills: v.optional(v.array(v.any())),
        experience: v.optional(v.array(v.any())),
        education: v.optional(v.array(v.any())),
      })
    ),
    fileStorageId: v.optional(v.id("_storage")),

    createdAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_fileName", ["fileName"]),

  // WORK REQUESTS
  workRequests: defineTable({
    userId: v.id("users"),
    requestType: v.union(
      v.literal("leave"),
      v.literal("overtime"),
      v.literal("compensatory_leave")
    ),
    leaveType: v.optional(
      v.union(
        v.literal("annual"),
        v.literal("sick"),
        v.literal("personal"),
        v.literal("emergency"),
        v.literal("maternity"),
        v.literal("paternity")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    daysRequested: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    overtimeHours: v.optional(v.number()),
    overtimeDate: v.optional(v.number()),
    compensationType: v.optional(
      v.union(v.literal("time_off"), v.literal("payment"), v.literal("both"))
    ),
    reason: v.string(),
    status: v.union(
      v.literal("pending_lm"),
      v.literal("pending_pm"),
      v.literal("pending_hr"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    ),
    lineManagerApproval: v.optional(
      v.object({
        status: v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected")
        ),
        approvedBy: v.optional(v.id("users")),
        reason: v.string(),
        approvedAt: v.optional(v.number()),
      })
    ),
    pmApproval: v.optional(
      v.object({
        status: v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected")
        ),
        approvedBy: v.optional(v.id("users")),
        reason: v.string(),
        approvedAt: v.optional(v.number()),
      })
    ),
    hrApproval: v.optional(
      v.object({
        status: v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected")
        ),
        approvedBy: v.optional(v.id("users")),
        reason: v.string(),
        approvedAt: v.optional(v.number()),
      })
    ),
    coveringUserId: v.optional(v.id("users")),
    handoverNotes: v.optional(v.string()),
    compensationDaysAwarded: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_request_type", ["requestType"])
    .index("by_status", ["status"])
    .index("by_user_type", ["userId", "requestType"])
    .index("by_project", ["projectId"])
    .index("by_covering_user", ["coveringUserId"])
    .index("by_date_range", ["startDate", "endDate"])
    .index("by_overtime_date", ["overtimeDate"]),

  // LEAVE BALANCES
  leaveBalances: defineTable({
    userId: v.id("users"),
    leaveYear: v.number(),
    annualLeaveEntitlement: v.number(),
    annualLeaveUsed: v.number(),
    compensatoryDaysBalance: v.number(),
    compensatoryDaysUsed: v.number(),
    annualLeaveRemaining: v.number(),
    totalAvailableDays: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_year", ["userId", "leaveYear"])
    .index("by_year", ["leaveYear"]),

  // TASKS
  tasks: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    assignedUserId: v.optional(v.id("users")),
    createdByUserId: v.id("users"),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    category: v.optional(v.string()),
    relatedSkillId: v.optional(v.id("skills")),
    skillProficiencyGain: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.number()),
    completedDate: v.optional(v.number()),
    dependsOnTaskIds: v.optional(v.array(v.id("tasks"))),
    notes: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_assigned_user", ["assignedUserId"])
    .index("by_created_by", ["createdByUserId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_due_date", ["dueDate"])
    .index("by_skill", ["relatedSkillId"]),

  //RECOMMENDATION FEEDBACK
  recommendationFeedback: defineTable({
    userId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    recommendationType: v.string(), // "project" or "user"
    rating: v.number(), // 1 for good, 0 for bad (mapped from boolean) we might need to implement a 1-5 scale later and map boolean to that
    comments: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  //RECOMMENDATIONS LOG
  // Python writes here, Frontend reads from here
  recommendations: defineTable({
    targetId: v.string(), // The UserID or ProjectID receiving the recommendation
    type: v.string(), // "user_for_project" or "project_for_user"
    results: v.array(
      v.object({
        id: v.string(), // ID of the recommended item
        score: v.number(),
        confidence: v.number(),
        reason: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
  }).index("by_target_type", ["targetId", "type"]),

  // PROJECT FEEDBACK
  projectFeedback: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    feedbackType: v.union(
      v.literal("performance"),
      v.literal("process"),
      v.literal("resources"),
      v.literal("skills"),
      v.literal("general")
    ),

    overallRating: v.optional(v.number()),
    communicationRating: v.optional(v.number()),
    technicalRating: v.optional(v.number()),
    timelinessRating: v.optional(v.number()),
    whatWentWell: v.optional(v.string()),
    whatCouldImprove: v.optional(v.string()),
    resourcesNeeded: v.optional(v.string()),
    skillsToFocus: v.optional(v.array(v.id("skills"))),
    isAnonymous: v.boolean(),
    submittedByUserId: v.id("users"),
    visibleToRoles: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_feedback_type", ["feedbackType"])
    .index("by_submitted_by", ["submittedByUserId"]),
  // ACTIVITIES
  activities: defineTable({
    userId: v.id("users"),
    type: v.string(),
    message: v.string(),
    relatedResourceId: v.optional(v.string()),
    relatedResourceType: v.optional(v.string()),
    priority: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"]),

  // EVENTS
  events: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    eventDate: v.number(),
    eventType: v.string(),
    priority: v.string(),
    relatedResourceId: v.optional(v.string()),
    relatedResourceType: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["eventDate"]),
});
