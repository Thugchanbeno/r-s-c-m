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
    .index("by_employee_type", ["employeeType"]),

  // SKILLS
  skills: defineTable({
    name: v.string(),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    aliases: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"]),

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
          documentStorageId: v.id("_storage"),
          fileName: v.string(),
          proofType: v.union(
            v.literal("certification"),
            v.literal("badge"),
            v.literal("document"),
            v.literal("portfolio")
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
    .index("by_status", ["status"]),

  // NOTIFICATIONS
  notifications: defineTable({
    userId: v.id("users"),
    message: v.string(),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    type: v.union(
      v.literal("new_request"),
      v.literal("request_approved"),
      v.literal("request_rejected"),
      v.literal("new_allocation"),
      v.literal("task_assigned"),
      v.literal("task_completed"),
      v.literal("skill_verification"),
      v.literal("system_alert"),
      v.literal("general_info")
    ),
    relatedResourceId: v.optional(v.string()),
    relatedResourceType: v.optional(
      v.union(
        v.literal("project"),
        v.literal("user"),
        v.literal("resourceRequest"),
        v.literal("allocation"),
        v.literal("task"),
        v.literal("userSkill")
      )
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"])
    .index("by_created_at", ["createdAt"]),

// CV CACHE
cvCache: defineTable({
  fileName: v.string(),
  rawText: v.string(),

  // Full NLP result
  extractedEntities: v.optional(v.any()),

  // Extracted skills
  extractedSkills: v.array(
    v.object({
      id: v.optional(v.string()),
      name: v.string(),
      category: v.optional(v.string()),
      similarity: v.optional(v.number()),
    })
  ),

  // Prepopulated structured data
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

  // File storage reference
  fileStorageId: v.optional(v.id("_storage")),

  createdAt: v.number(),
})
  .index("by_created_at", ["createdAt"])
  .index("by_fileName", ["fileName"]),

// WORK REQUESTS (Leave, Overtime, etc.)
workRequests: defineTable({
  userId: v.id("users"),
  requestType: v.union(
    v.literal("leave"),
    v.literal("overtime"),
    v.literal("compensatory_leave") // using comp days
  ),
  
  // Leave-specific fields
  leaveType: v.optional(v.union(
    v.literal("annual"),
    v.literal("sick"),
    v.literal("personal"),
    v.literal("emergency"),
    v.literal("maternity"),
    v.literal("paternity")
  )),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  daysRequested: v.optional(v.number()),
  
  // Overtime-specific fields
  projectId: v.optional(v.id("projects")),
  overtimeHours: v.optional(v.number()),
  overtimeDate: v.optional(v.number()),
  compensationType: v.optional(v.union(
    v.literal("time_off"), // compensatory days off
    v.literal("payment"),  // monetary compensation (future)
    v.literal("both")
  )),
  
  // Common fields
  reason: v.string(),
  status: v.union(
    v.literal("pending_lm"),
    v.literal("pending_pm"),
    v.literal("pending_hr"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("cancelled")
  ),
  
  // Approval workflow
  lineManagerApproval: v.optional(
    v.object({
      status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
      approvedBy: v.optional(v.id("users")),
      reason: v.string(),
      approvedAt: v.optional(v.number()),
    })
  ),
  pmApproval: v.optional(
    v.object({
      status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
      approvedBy: v.optional(v.id("users")),
      reason: v.string(),
      approvedAt: v.optional(v.number()),
    })
  ),
  hrApproval: v.optional(
    v.object({
      status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
      approvedBy: v.optional(v.id("users")),
      reason: v.string(),
      approvedAt: v.optional(v.number()),
    })
  ),

  // Coverage details (for leave)
  coveringUserId: v.optional(v.id("users")),
  handoverNotes: v.optional(v.string()),
  
  // Compensation tracking (for overtime)
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

// LEAVE BALANCES (separate tracking table)
leaveBalances: defineTable({
  userId: v.id("users"),
  leaveYear: v.number(), // e.g., 2024, 2025
  annualLeaveEntitlement: v.number(), // default 21
  annualLeaveUsed: v.number(), // default 0
  compensatoryDaysBalance: v.number(), // overtime compensation days (1:1 ratio)
  compensatoryDaysUsed: v.number(), // comp days used
  
  // Auto-calculated fields
  annualLeaveRemaining: v.number(),
  totalAvailableDays: v.number(), // annual + compensatory
  
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
  
  category: v.optional(v.string()), // e.g., "frontend", "backend", "design"
  
  // Skill development tracking
  relatedSkillId: v.optional(v.id("skills")),
  skillProficiencyGain: v.optional(v.number()), // points gained for completing this task
  
  // Time tracking
  estimatedHours: v.optional(v.number()),
  actualHours: v.optional(v.number()),
  
  // Dates
  dueDate: v.optional(v.number()),
  startDate: v.optional(v.number()),
  completedDate: v.optional(v.number()),
  
  // Dependencies
  dependsOnTaskIds: v.optional(v.array(v.id("tasks"))),
  
  // Comments/Notes
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
  
  // Ratings (1-5 scale)
  overallRating: v.optional(v.number()),
  communicationRating: v.optional(v.number()),
  technicalRating: v.optional(v.number()),
  timelinessRating: v.optional(v.number()),
  
  // Text feedback
  whatWentWell: v.optional(v.string()),
  whatCouldImprove: v.optional(v.string()),
  resourcesNeeded: v.optional(v.string()),
  skillsToFocus: v.optional(v.array(v.id("skills"))),
  
  // Anonymous option
  isAnonymous: v.boolean(),
  submittedByUserId: v.id("users"), // always track who submitted, even if anonymous
  
  // Visibility
  visibleToRoles: v.array(v.string()), // ["pm", "hr", "admin"] etc.
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_user", ["userId"])
  .index("by_feedback_type", ["feedbackType"])
  .index("by_submitted_by", ["submittedByUserId"]),
});
