"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";

export const useTasks = (projectId = null, filters = {}) => {
  const { user } = useAuth();

  const queryArgs = user?.email
    ? {
        email: user.email,
        ...(projectId ? { projectId } : {}),
        ...filters,
      }
    : "skip";

  // Queries
  const tasks = useQuery(api.tasks.getAll, queryArgs);

  const task = useQuery(
    api.tasks.getById,
    filters.taskId && user?.email
      ? { email: user.email, id: filters.taskId }
      : "skip"
  );

  // Mutations
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);

  // Handlers
  const handleCreateTask = async (data) => {
    if (!user?.email) return;
    try {
      await createTask({ email: user.email, ...data }); // ✅ email only for actor lookup
      toast.success("Task created successfully!");
    } catch (err) {
      console.error("Task creation error:", err);
      toast.error(err.message || "Failed to create task.");
    }
  };

  const handleUpdateTask = async (id, updates) => {
    if (!user?.email) return;
    try {
      await updateTask({ email: user.email, id, ...updates }); // ✅ email only for actor lookup
      toast.success("Task updated successfully!");
    } catch (err) {
      console.error("Task update error:", err);
      toast.error(err.message || "Failed to update task.");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!user?.email) return;
    try {
      await deleteTask({ email: user.email, id }); // ✅ email only for actor lookup
      toast.success("Task deleted successfully!");
    } catch (err) {
      console.error("Task delete error:", err);
      toast.error(err.message || "Failed to delete task.");
    }
  };

  return {
    tasks,
    task,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
  };
};
