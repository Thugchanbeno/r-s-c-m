"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";

export const useProjects = (projectId = null) => {
  const { user: authUser } = useAuth();

  // Queries
  const projects = useQuery(
    api.projects.getAll,
    authUser?.email ? { email: authUser.email } : "skip"
  );
  const project = useQuery(
    api.projects.getById,
    projectId ? { id: projectId } : "skip"
  );
  const allocations = useQuery(
    api.allocations.getAll,
    projectId ? { projectId } : "skip"
  );
  const tasks = useQuery(
    api.tasks.getByProject,
    projectId ? { projectId } : "skip"
  );
  const utilization = useQuery(
    api.projects.getUtilizationReport,
    projectId ? { email: authUser?.email, projectId } : "skip"
  );

  // Mutations
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const extractSkills = useMutation(api.projects.extractSkillsFromDescription);

  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);

  const createResourceRequest = useMutation(api.resourcerequests.create);
  const processResourceRequest = useMutation(
    api.resourcerequests.processApproval
  );

  const [loading, setLoading] = useState(false);

  // Handlers
  const handleCreateProject = useCallback(
    async (formData) => {
      if (!authUser?.email) return;
      setLoading(true);
      try {
        await createProject({ email: authUser.email, ...formData });
        toast.success("Project created successfully!");
      } catch (err) {
        toast.error(err.message || "Failed to create project.");
      } finally {
        setLoading(false);
      }
    },
    [authUser?.email, createProject]
  );

  const handleUpdateProject = useCallback(
    async (formData) => {
      if (!authUser?.email || !projectId) return;
      setLoading(true);
      try {
        await updateProject({
          email: authUser.email,
          id: projectId,
          ...formData,
        });
        toast.success("Project updated successfully!");
      } catch (err) {
        toast.error(err.message || "Failed to update project.");
      } finally {
        setLoading(false);
      }
    },
    [authUser?.email, projectId, updateProject]
  );

  const handleExtractSkills = useCallback(
    async (description) => {
      if (!authUser?.email || !projectId) return [];
      try {
        const result = await extractSkills({
          email: authUser.email,
          projectId,
          description,
        });
        return result.extractedSkills || [];
      } catch (err) {
        toast.error("Failed to extract skills.");
        return [];
      }
    },
    [authUser?.email, projectId, extractSkills]
  );

  const handleCreateTask = useCallback(
    async (taskData) => {
      if (!authUser?.email) return;
      try {
        await createTask({ email: authUser.email, ...taskData });
        toast.success("Task created successfully!");
      } catch (err) {
        toast.error("Failed to create task.");
      }
    },
    [authUser?.email, createTask]
  );

  const handleUpdateTask = useCallback(
    async (taskId, updates) => {
      if (!authUser?.email) return;
      try {
        await updateTask({ email: authUser.email, id: taskId, ...updates });
        toast.success("Task updated successfully!");
      } catch (err) {
        toast.error("Failed to update task.");
      }
    },
    [authUser?.email, updateTask]
  );

  const handleDeleteTask = useCallback(
    async (taskId) => {
      if (!authUser?.email) return;
      try {
        await deleteTask({ email: authUser.email, id: taskId });
        toast.success("Task deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete task.");
      }
    },
    [authUser?.email, deleteTask]
  );

  const handleCreateResourceRequest = useCallback(
    async (requestData) => {
      if (!authUser?.email) return;
      try {
        await createResourceRequest({ email: authUser.email, ...requestData });
        toast.success("Resource request submitted!");
      } catch (err) {
        toast.error("Failed to submit resource request.");
      }
    },
    [authUser?.email, createResourceRequest]
  );

  const handleProcessResourceRequest = useCallback(
    async (requestId, action, reason) => {
      if (!authUser?.email) return;
      try {
        await processResourceRequest({
          email: authUser.email,
          requestId,
          action,
          reason,
        });
        toast.success(`Request ${action}d successfully!`);
      } catch (err) {
        toast.error("Failed to process request.");
      }
    },
    [authUser?.email, processResourceRequest]
  );

  return {
    projects,
    project,
    allocations,
    tasks,
    utilization,
    loading,
    handleCreateProject,
    handleUpdateProject,
    handleExtractSkills,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleCreateResourceRequest,
    handleProcessResourceRequest,
  };
};
