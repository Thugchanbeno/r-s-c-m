import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // USERS
  users: defineTable({
    name: v.string(),
    email: v.string(),
    authProviderId: v.string(),
    department: v.optional(v.string()),

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

    // new fields we added for migration
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
    extractedSkills: v.array(
      v.object({
        id: v.optional(v.string()),
        name: v.string(),
        category: v.optional(v.string()),
        similarity: v.optional(v.number()),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_fileName", ["fileName"]),
});