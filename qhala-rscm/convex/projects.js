import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

function requireRole(user, allowed) {
  if (!user || !allowed.includes(user.role)) {
    throw new Error("You don’t have permission to perform this action.");
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
// convex/projects.js - Update the getAll function
export const getAll = query({
  args: {
    email: v.string(),
    pmId: v.optional(v.id("users")), // ✅ Make pmId optional
    countOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    let projects = [];
    if (args.pmId) {
      // Only check permissions if pmId is provided
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
      // Show all projects if user has permission
      requireRole(actor, ["admin", "hr", "pm"]);
      projects = await ctx.db.query("projects").collect();
    }

    if (args.countOnly) return { count: projects.length };
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
    department: v.string(),
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
          category: v.optional(v.string()),
        })
      )
    ),
    nlpExtractedSkills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["pm", "hr", "admin"]);

    if (!args.name || !args.description || !args.department) {
      throw new Error(
        "Project name, description, and department are required."
      );
    }

    const now = Date.now();
    const { email, ...updates } = args;
    return await ctx.db.insert("projects", {
      ...updates,
      pmId: actor._id,
      status: args.status || "Planning",
      requiredSkills: args.requiredSkills || [],
      nlpExtractedSkills: args.nlpExtractedSkills || [],
      createdAt: now,
      updatedAt: now,
    });
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
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found.");

    if (project.pmId !== actor._id && !["admin", "hr"].includes(actor.role)) {
      throw new Error("You can only update your own projects.");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true, message: "Project updated successfully." };
  },
});

export const extractSkillsFromDescription = mutation({
  args: {
    email: v.string(),
    projectId: v.optional(v.id("projects")),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["pm", "hr", "admin"]);

    if (!args.description || args.description.trim() === "") {
      throw new Error("Description is required.");
    }

    const nlpServiceUrl = `${
      process.env.NLP_API_URL || "http://localhost:8000"
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

      // Optionally persist to project
      if (args.projectId) {
        await ctx.db.patch(args.projectId, {
          nlpExtractedSkills: extractedSkills.map((s) => s.name || s),
          updatedAt: Date.now(),
        });
      }

      return { success: true, extractedSkills };
    } catch (err) {
      console.error("Skill extraction error:", err);
      throw new Error("Failed to extract skills from description.");
    }
  },
});

// --- RECOMMENDATIONS ---
export const getRecommendations = query({
  args: {
    email: v.string(),
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);
    requireRole(actor, ["pm", "hr", "admin"]);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const nlpServiceUrl = `${
      process.env.NLP_API_URL || "http://localhost:8000"
    }/recommend/users-for-project`;

    try {
      const response = await fetch(nlpServiceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: args.projectId,
          requiredSkills: project.requiredSkills || [],
          limit: args.limit || 10,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || result.error || "Recommendation service failed"
        );
      }

      if (!Array.isArray(result.recommendations)) {
        throw new Error("Invalid recommendation data format.");
      }

      return { success: true, users: result.recommendations };
    } catch (err) {
      console.error("Recommendation error:", err);
      throw new Error("Failed to fetch recommendations.");
    }
  },
});

// Utilization report
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

// Org-level reporting
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
