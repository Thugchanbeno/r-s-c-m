import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { createNotification } from "./notificationUtils";

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

// --- GET ALL TASKS ---
export const getAll = query({
  args: {
    email: v.string(),
    projectId: v.optional(v.id("projects")),
    assignedUserId: v.optional(v.id("users")),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    skip: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, args.email);

    let tasks = [];

    if (args.projectId) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
    } else if (args.assignedUserId) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_assigned_user", (q) =>
          q.eq("assignedUserId", args.assignedUserId)
        )
        .collect();
    } else {
      tasks = await ctx.db.query("tasks").collect();
    }

    // Permission filtering
    if (!["admin", "hr"].includes(actor.role)) {
      const filteredTasks = [];
      for (const task of tasks) {
        if (
          task.assignedUserId === actor._id ||
          task.createdByUserId === actor._id
        ) {
          filteredTasks.push(task);
          continue;
        }

        if (actor.role === "pm") {
          const project = await ctx.db.get(task.projectId);
          if (project && project.pmId === actor._id) {
            filteredTasks.push(task);
          }
        }
      }
      tasks = filteredTasks;
    }

    // Filters
    if (args.status) {
      tasks = tasks.filter((t) => t.status === args.status);
    }
    if (args.priority) {
      tasks = tasks.filter((t) => t.priority === args.priority);
    }

    // Enrichment
    const enrichedTasks = [];
    for (const task of tasks) {
      const assignedUser = task.assignedUserId
        ? await ctx.db.get(task.assignedUserId)
        : null;
      const createdByUser = await ctx.db.get(task.createdByUserId);
      const project = await ctx.db.get(task.projectId);
      const relatedSkill = task.relatedSkillId
        ? await ctx.db.get(task.relatedSkillId)
        : null;

      enrichedTasks.push({
        ...task,
        assignedUserName: assignedUser?.name,
        createdByUserName: createdByUser?.name,
        projectName: project?.name,
        relatedSkillName: relatedSkill?.name,
      });
    }

    const skip = args.skip ?? 0;
    const limit = args.limit ?? 50;

    return enrichedTasks.slice(skip, skip + limit);
  },
});

// --- CREATE TASK ---
export const create = mutation({
  args: {
    email: v.string(),
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    assignedUserId: v.optional(v.id("users")),
    assignedUserIds: v.optional(v.array(v.id("users"))),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    category: v.optional(v.string()),
    relatedSkillId: v.optional(v.id("skills")),
    skillProficiencyGain: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    dependsOnTaskIds: v.optional(v.array(v.id("tasks"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { email, ...taskData } = args; // ✅ strip email
    const actor = await getActor(ctx, email);

    const project = await ctx.db.get(taskData.projectId);
    if (!project) throw new Error("Project not found.");

    const canCreate =
      project.pmId === actor._id ||
      taskData.assignedUserId === actor._id ||
      ["admin", "hr"].includes(actor.role);

    if (!canCreate) {
      throw new Error(
        "You don't have permission to create tasks for this project."
      );
    }

    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      ...taskData,
      createdByUserId: actor._id,
      status: taskData.status || "todo",
      startDate: now,
      createdAt: now,
      updatedAt: now,
    });

    if (taskData.assignedUserId && taskData.assignedUserId !== actor._id) {
      await createNotification(ctx, {
        userId: taskData.assignedUserId,
        type: "task_assigned",
        title: "New Task Assignment",
        message: `You have been assigned a new task: "${taskData.title}" in project "${project.name}"`,
        link: `/tasks/${taskId}`,
        actionUrl: `/tasks/${taskId}`,
        requiresAction: true,
        relatedResourceId: taskId,
        relatedResourceType: "task",
        actionUserId: actor._id,
        actionUserRole: actor.role,
        contextData: {
          projectId: taskData.projectId,
          projectName: project.name,
          taskTitle: taskData.title,
          priority: taskData.priority,
          actionUserName: actor.name,
          actionUserAvatar: actor.avatarUrl,
        },
      });
    }

    return taskId;
  },
});

// --- UPDATE TASK ---
export const update = mutation({
  args: {
    email: v.string(),
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assignedUserId: v.optional(v.id("users")),
    assignedUserIds: v.optional(v.array(v.id("users"))),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    dueDate: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    actualHours: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { email, id, dueDate, ...updates } = args; // ✅ strip email
    const actor = await getActor(ctx, email);

    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task not found.");

    const project = await ctx.db.get(task.projectId);
    if (!project) throw new Error("Project not found.");

    const canUpdate =
      task.assignedUserId === actor._id ||
      task.createdByUserId === actor._id ||
      project.pmId === actor._id ||
      ["admin", "hr"].includes(actor.role);

    if (!canUpdate) {
      throw new Error("You don't have permission to update this task.");
    }

    const now = Date.now();

    if (updates.status === "completed" && task.status !== "completed") {
      updates.completedDate = now;

      if (
        task.relatedSkillId &&
        task.skillProficiencyGain &&
        task.assignedUserId
      ) {
        await awardSkillProficiency(
          ctx,
          task.assignedUserId,
          task.relatedSkillId,
          task.skillProficiencyGain
        );
      }

      if (project.pmId && project.pmId !== actor._id) {
        await createNotification(ctx, {
          userId: project.pmId,
          type: "task_completed",
          title: "Task Completed",
          message: `Task "${task.title}" has been completed by ${actor.name}`,
          link: `/tasks/${id}`,
          relatedResourceId: id,
          relatedResourceType: "task",
          actionUserId: actor._id,
          actionUserRole: actor.role,
          contextData: {
            projectId: task.projectId,
            projectName: project.name,
            taskTitle: task.title,
            completedByName: actor.name,
            skillProficiencyGain: task.skillProficiencyGain,
            actionUserName: actor.name,
            actionUserAvatar: actor.avatarUrl,
          },
        });
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });

    return { success: true, message: "Task updated successfully." };
  },
});

// --- DELETE TASK ---
export const remove = mutation({
  args: { email: v.string(), id: v.id("tasks") },
  handler: async (ctx, args) => {
    const { email, id } = args;
    const actor = await getActor(ctx, email);

    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task not found.");

    const project = await ctx.db.get(task.projectId);
    if (!project) throw new Error("Project not found.");

    const canDelete =
      task.createdByUserId === actor._id ||
      project.pmId === actor._id ||
      ["admin", "hr"].includes(actor.role);

    if (!canDelete) {
      throw new Error("You don't have permission to delete this task.");
    }

    await ctx.db.delete(id);
    return { success: true, message: "Task deleted successfully." };
  },
});

// --- GET TASK BY ID ---
export const getById = query({
  args: { email: v.string(), id: v.id("tasks") },
  handler: async (ctx, args) => {
    await getActor(ctx, args.email);

    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found.");

    const assignedUser = task.assignedUserId
      ? await ctx.db.get(task.assignedUserId)
      : null;
    const createdByUser = await ctx.db.get(task.createdByUserId);
    const project = await ctx.db.get(task.projectId);
    const relatedSkill = task.relatedSkillId
      ? await ctx.db.get(task.relatedSkillId)
      : null;

    return {
      ...task,
      assignedUser,
      createdByUser,
      project,
      relatedSkill,
    };
  },
});

// --- Helper: Award skill proficiency ---
async function awardSkillProficiency(ctx, userId, skillId, points) {
  const userSkill = await ctx.db
    .query("userSkills")
    .withIndex("by_user_skill", (q) =>
      q.eq("userId", userId).eq("skillId", skillId)
    )
    .first();

  if (userSkill) {
    const currentProficiency = userSkill.proficiency || 1;
    const newProficiency = Math.min(5, currentProficiency + points / 10);

    await ctx.db.patch(userSkill._id, {
      proficiency: newProficiency,
      updatedAt: Date.now(),
    });
  }
}
