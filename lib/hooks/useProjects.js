// lib/hooks/useProjects.js
"use client";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTasks } from "@/lib/hooks/useTasks";
import { toast } from "sonner";

export const useProjects = (pmId = null, filters = {}) => {
  const { user } = useAuth();

  const queryArgs = user?.email
    ? {
        email: user.email,
        ...(pmId && pmId.startsWith("users/") ? { pmId } : {}),
        ...filters,
      }
    : "skip";

  // Queries
  const projects = useQuery(api.projects.getAll, queryArgs);

  const project = useQuery(
    api.projects.getById,
    filters.projectId ? { id: filters.projectId } : "skip"
  );

  // Mutations
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  
  // Actions
  const extractSkills = useAction(api.projects.extractSkillsFromDescription);

  // Task hook for project creation
  const { handleCreateTask } = useTasks();

  // Handlers
  const handleCreateProject = async ({ projectData, tasks = [] }) => {
    if (!user?.email) throw new Error("User not authenticated");

    try {
      const projectPayload = {
        email: user.email,
        name: projectData.name,
        description: projectData.description,
        department: projectData.department,
        status: projectData.status || "Planning",
        startDate: projectData.startDate || undefined,
        endDate: projectData.endDate || undefined,
        requiredSkills: projectData.requiredSkills || [],
        nlpExtractedSkills: projectData.nlpExtractedSkills || [],
      };

      const projectId = await createProject(projectPayload);

      if (tasks.length > 0) {
        for (const task of tasks) {
          const taskPayload = {
            email: user.email,
            projectId,
            title: task.title,
            description: task.description || undefined,
            status: task.status || "todo",
            priority: task.priority || "medium",
            estimatedHours: task.estimatedHours || undefined,
            dueDate: task.dueDate || undefined,
            assignedUserIds: task.assignedUserIds || [],
          };
          await handleCreateTask(taskPayload);
        }
      }

      toast.success("Project created successfully!");
      return projectId;
    } catch (err) {
      console.error("Project creation error:", err);
      toast.error("Failed to create project: " + err.message);
      throw err;
    }
  };

  const handleUpdateProject = async (id, updates) => {
    if (!user?.email) return;
    try {
      await updateProject({ email: user.email, id, ...updates });
      toast.success("Project updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update project.");
      throw err;
    }
  };

  const handleExtractSkills = async (projectId, description) => {
    if (!user?.email) return [];
    try {
      const result = await extractSkills({
        email: user.email,
        projectId: projectId || undefined,
        description,
      });
      return result.extractedSkills || [];
    } catch (err) {
      toast.error("Failed to extract skills.");
      return [];
    }
  };

  return {
    projects,
    project,
    authUser: user,
    user,
    loading: projects === undefined,
    handleCreateProject,
    handleUpdateProject,
    handleExtractSkills,
  };
};
