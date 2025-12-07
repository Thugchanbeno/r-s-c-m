import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import {
  createNotification,
  createBulkNotifications,
} from "./notificationUtils";
import { canEditProject } from "./rbac";

function requireRole(user, allowed) {
  if (!user || !allowed.includes(user.role)) {
    throw new Error("You don't have permission to perform this action.");
  }
}

async function getActor(ctx, email) {
  if (!email) throw new Error("Unauthorized: missing email");
  const actor = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  if (!actor) throw new Error("User not found");
  return actor;
}
// GET /api/projects
export const getAll = query({
  args: {
    email: v.string(),
    pmId: v.optional(v.id("users")),
    department: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("Planning"),
        v.literal("Active"),
        v.literal("On Hold"),
        v.literal("Completed"),
        v.literal("Cancelled")
      )
    ),
    countOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    let projects = [];
    if (args.pmId) {
      if (
        actor._id !== args.pmId &&
        !["admin", "hr", "pm"].includes(actor.role)
      ) {
        throw new Error(
          "You can only view your own projects or have admin/hr privileges."
        );
      }
      projects = await ctx.db
        .query("projects")
        .withIndex("by_pm", (q) => q.eq("pmId", args.pmId))
        .collect();
    } else {
      requireRole(actor, ["admin", "hr", "pm", "line_manager"]);
      projects = await ctx.db.query("projects").collect();
    }
    if (args.department) {
      projects = projects.filter(
        (p) => p.department === args.department && p.department !== "Unassigned"
      );
    }
    if (args.status) {
      projects = projects.filter((p) => p.status === args.status);
    }

    if (args.countOnly) return { count: projects.length };

    return projects.sort((a, b) => a.name.localeCompare(b.name));
  },
});
// GET /api/projects/for-user
export const getForUser = query({
  args: { email: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    // Employees can only fetch their own projects
    if (actor._id !== args.userId && !["admin", "hr"].includes(actor.role)) {
      throw new Error("You can only view your own projects.");
    }

    // Find allocations for this user
    const allocations = await ctx.db
      .query("allocations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const projectIds = [...new Set(allocations.map((a) => a.projectId))];

    const projects = [];
    for (const pid of projectIds) {
      const project = await ctx.db.get(pid);
      if (project) projects.push(project);
    }

    return projects.sort((a, b) => a.name.localeCompare(b.name));
  },
});
// GET /api/projects/[id]
export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found.");
    return project;
  },
});
// POST /api/projects
export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    description: v.string(),
    department: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("Planning"),
        v.literal("Active"),
        v.literal("On Hold"),
        v.literal("Completed"),
        v.literal("Cancelled")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    embedding: v.optional(v.array(v.float64())),
    nlpExtractedSkills: v.optional(v.array(v.string())),
    requiredSkills: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    if (!["pm", "hr", "admin"].includes(actor.role)) {
      throw new Error("You don't have permission to perform this action.");
    }
    let resolvedSkills = [];
    if (args.requiredSkills && args.requiredSkills.length > 0) {
      resolvedSkills = await Promise.all(
        args.requiredSkills.map(async (skill) => {
          if (skill.skillId) return skill;

          const name = skill.skillName || skill.name;
          if (!name) return null;

          let existingSkill = await ctx.db
            .query("skills")
            .withIndex("by_name", (q) => q.eq("name", name))
            .first();

          let skillId = existingSkill
            ? existingSkill._id
            : await ctx.db.insert("skills", {
                name: name,
                category: skill.category || "Uncategorized",
                description: "Auto-generated from Project",
                aliases: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });

          return {
            skillId,
            skillName: name,
            proficiencyLevel: skill.proficiencyLevel || 1,
            isRequired: skill.isRequired !== false,
            category: skill.category,
          };
        })
      );
      resolvedSkills = resolvedSkills.filter((s) => s !== null);
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      department: args.department || "Unassigned",
      pmId: actor._id,
      status: args.status || "Planning",
      startDate: args.startDate,
      endDate: args.endDate,
      embedding: args.embedding,
      requiredSkills: resolvedSkills,
      nlpExtractedSkills: args.nlpExtractedSkills || [],
      createdAt: now,
      updatedAt: now,
    });
    const stakeholders = await ctx.db
      .query("users")
      .filter((q) =>
        q.or(q.eq(q.field("role"), "hr"), q.eq(q.field("role"), "admin"))
      )
      .collect();

    if (stakeholders.length > 0) {
      await createBulkNotifications(ctx, {
        userIds: stakeholders.map((u) => u._id),
        type: "project_status_changed",
        title: "New Project Created",
        message: `${actor.name} created new project: "${args.name}"`,
        link: `/projects/${projectId}`,
        relatedResourceId: projectId,
        relatedResourceType: "project",
        actionUserId: actor._id,
        actionUserRole: actor.role,
        contextData: {
          projectName: args.name,
          department: args.department,
          skillCount: resolvedSkills.length,
        },
      });
    }

    return projectId;
  },
});
// PUT /api/projects
export const update = mutation({
  args: {
    email: v.string(),
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    department: v.optional(v.string()),
    function: v.optional(
      v.union(
        v.literal("q-trust"),
        v.literal("q-lab"),
        v.literal("consultants"),
        v.literal("qhala")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("Planning"),
        v.literal("Active"),
        v.literal("On Hold"),
        v.literal("Completed"),
        v.literal("Cancelled")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
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
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found.");

    canEditProject(actor, project);

    const { id, email, ...updates } = args;
    const oldProject = { ...project };

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    if (updates.status && updates.status !== oldProject.status) {
      const allocations = await ctx.db
        .query("allocations")
        .withIndex("by_project", (q) => q.eq("projectId", id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      const teamMemberIds = allocations
        .map((a) => a.userId)
        .filter((userId) => userId !== actor._id);

      if (teamMemberIds.length > 0) {
        await createBulkNotifications(ctx, {
          userIds: teamMemberIds,
          type: "project_status_changed",
          title: "Project Status Update",
          message: `Project "${oldProject.name}" status changed from ${oldProject.status} to ${updates.status}`,
          link: `/projects/${id}`,
          relatedResourceId: id,
          relatedResourceType: "project",
          actionUserId: actor._id,
          actionUserRole: actor.role,
          contextData: {
            projectName: oldProject.name,
            oldStatus: oldProject.status,
            newStatus: updates.status,
            updatedByName: actor.name,
          },
        });
      }
    }

    return { success: true, message: "Project updated successfully." };
  },
});

export const extractSkillsFromDescription = action({
  args: {
    email: v.string(),
    projectId: v.optional(v.id("projects")),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.runQuery(internal.projects.getActorByEmail, {
      email: args.email,
    });

    if (!actor || !["pm", "hr", "admin"].includes(actor.role)) {
      throw new Error("You don't have permission to perform this action.");
    }

    const nlpServiceUrl = `${
      process.env.NLP_API_URL_LOCAL || "http://localhost:8000"
    }/extract-skills`;

    try {
      const response = await fetch(nlpServiceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: args.projectId || undefined,
          text: args.description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || result.error || "NLP service request failed"
        );
      }

      const extractedSkills = result.extracted_skills || [];

      if (args.projectId) {
        await ctx.runMutation(internal.projects.updateProjectSkills, {
          projectId: args.projectId,
          nlpExtractedSkills: extractedSkills.map((s) => s.name || s),
        });
      }

      return { success: true, extractedSkills };
    } catch (err) {
      console.error("Skill extraction error:", err);
      throw new Error("Failed to extract skills from description.");
    }
  },
});

export const getRecommendations = action({
  args: {
    email: v.string(),
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.runQuery(internal.projects.getActorByEmail, {
      email: args.email,
    });

    if (!actor || !["pm", "hr", "admin"].includes(actor.role)) {
      throw new Error("You don't have permission to perform this action.");
    }

    const project = await ctx.runQuery(internal.projects.getProjectById, {
      id: args.projectId,
    });
    if (!project) throw new Error("Project not found");

    const nlpServiceUrl = `${
      process.env.NLP_API_URL || "http://localhost:8000"
    }/recommend/users-for-project`;

    try {
      const payload = {
        id: args.projectId,
        limit: args.limit || 10,
      };

      const response = await fetch(nlpServiceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            result.error ||
            `Python service failed with status ${response.status}`
        );
      }

      if (result && Array.isArray(result.recommendations)) {
        return { success: true, users: result.recommendations };
      } else {
        throw new Error("Invalid or missing recommendation data from service.");
      }
    } catch (err) {
      console.error("Recommendation error:", err);
      throw new Error(err.message || "Failed to fetch recommendations.");
    }
  },
});

export const getUtilizationReport = query({
  args: { email: v.string(), projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["pm", "hr", "admin"]);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found.");

    const allocations = await ctx.db
      .query("allocations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const utilizationData = [];
    let totalAllocatedHours = 0;
    let totalPossibleHours = 0;

    for (const allocation of allocations) {
      const user = await ctx.db.get(allocation.userId);
      if (!user) continue;

      const weeklyHours = user.weeklyHours || 40;
      const allocatedHours =
        (allocation.allocationPercentage / 100) * weeklyHours;

      totalAllocatedHours += allocatedHours;
      totalPossibleHours += weeklyHours;

      utilizationData.push({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        role: allocation.role,
        allocationPercentage: allocation.allocationPercentage,
        weeklyHours,
        allocatedHours,
        status: allocation.status,
        startDate: allocation.startDate,
        endDate: allocation.endDate,
      });
    }
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      todo: tasks.filter((t) => t.status === "todo").length,
      overdue: tasks.filter(
        (t) => t.dueDate && t.dueDate < Date.now() && t.status !== "completed"
      ).length,
    };

    return {
      project: {
        id: project._id,
        name: project.name,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
      },
      utilization: {
        totalAllocatedHours,
        totalPossibleHours,
        utilizationPercentage:
          totalPossibleHours > 0
            ? Math.round((totalAllocatedHours / totalPossibleHours) * 100)
            : 0,
        teamSize: utilizationData.length,
        allocations: utilizationData,
      },
      tasks: taskStats,
    };
  },
});

export const getByOrganization = query({
  args: {
    email: v.string(),
    function: v.optional(
      v.union(
        v.literal("q-trust"),
        v.literal("q-lab"),
        v.literal("consultants"),
        v.literal("qhala")
      )
    ),
    department: v.optional(v.string()),
    includeUtilization: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["pm", "hr", "admin"]);

    let projects = await ctx.db.query("projects").collect();

    if (args.function) {
      projects = projects.filter((p) => p.function === args.function);
    }
    if (args.department) {
      projects = projects.filter((p) => p.department === args.department);
    }

    if (args.includeUtilization) {
      const projectsWithUtilization = [];
      for (const project of projects) {
        const allocations = await ctx.db
          .query("allocations")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        let totalAllocatedHours = 0;
        let teamSize = 0;

        for (const allocation of allocations) {
          const user = await ctx.db.get(allocation.userId);
          if (user) {
            const weeklyHours = user.weeklyHours || 40;
            totalAllocatedHours +=
              (allocation.allocationPercentage / 100) * weeklyHours;
            teamSize++;
          }
        }

        projectsWithUtilization.push({
          ...project,
          utilization: {
            totalAllocatedHours,
            teamSize,
            activeAllocations: allocations.filter((a) => a.status === "active")
              .length,
          },
        });
      }
      return projectsWithUtilization;
    }

    return projects;
  },
});

export const getActorByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    if (!args.email) throw new Error("Unauthorized: missing email");
    const actor = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (!actor) throw new Error("User not found");
    return actor;
  },
});

export const getProjectById = internalQuery({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found.");
    return project;
  },
});

export const updateProjectSkills = internalMutation({
  args: {
    projectId: v.id("projects"),
    nlpExtractedSkills: v.array(v.string()),
    requiredSkills: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    const updates = {
      nlpExtractedSkills: args.nlpExtractedSkills,
      updatedAt: Date.now(),
    };
    if (args.requiredSkills) {
      updates.requiredSkills = args.requiredSkills;
    }
    await ctx.db.patch(args.projectId, updates);
  },
});

export const logFeedback = mutation({
  args: {
    userId: v.string(),
    projectId: v.string(),
    recommendationType: v.string(),
    rating: v.number(),
    comments: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("recommendationFeedback", args);
  },
});

export const getTeam = query({
  args: {
    projectId: v.id("projects"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    const allocations = await ctx.db
      .query("allocations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (allocations.length === 0) return [];
    const teamMembers = await Promise.all(
      allocations.map(async (a) => {
        const user = await ctx.db.get(a.userId);
        if (!user) return null;
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: a.role,
        };
      })
    );

    return teamMembers.filter(Boolean);
  },
});
