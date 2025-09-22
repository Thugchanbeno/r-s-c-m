// lib/hooks/useProjectDetailsData.js
"use client";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTasks } from "@/lib/hooks/useTasks";
import { toast } from "sonner";

export const useProjectDetailsData = (projectId) => {
  const { user } = useAuth();

  // --- Convex Queries ---
  const project = useQuery(
    api.projects.getById,
    projectId ? { id: projectId } : "skip"
  );

  const allocations = useQuery(
    api.allocations.getAll,
    user?.email && projectId ? { email: user.email, projectId } : "skip"
  );

  const utilization = useQuery(
    api.projects.getUtilizationReport,
    user?.email && projectId ? { email: user.email, projectId } : "skip"
  );

  // --- Tasks (CRUD via useTasks) ---
  const { tasks, handleCreateTask, handleUpdateTask, handleDeleteTask } =
    useTasks(projectId);

  // --- Local State for Recommendations & Resource Requests ---
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [userToRequest, setUserToRequest] = useState(null);

  // --- Convex Mutations ---
  const createResourceRequest = useMutation(api.resourceRequests.create);
  
  // --- Convex Actions ---
  const getProjectRecommendations = useAction(api.projects.getRecommendations);

  // --- Handlers ---
  const handleFetchRecommendations = useCallback(async () => {
    if (!user?.email || !projectId) return;
    setLoadingRecommendations(true);
    setRecommendationError(null);
    setShowRecommendations(true);

    try {
      const result = await getProjectRecommendations({
        email: user.email,
        projectId: projectId,
        limit: 5
      });

      if (result.success) {
        setRecommendedUsers(result.users || []);
      } else {
        throw new Error(result.error || "Failed to fetch recommendations");
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setRecommendationError(err.message);
      setRecommendedUsers([]);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [user?.email, projectId, getProjectRecommendations]);

  const handleInitiateResourceRequest = useCallback((user) => {
    setUserToRequest(user);
    setIsRequestModalOpen(true);
  }, []);

  const handleCloseRequestModal = useCallback(() => {
    setIsRequestModalOpen(false);
    setUserToRequest(null);
    setIsSubmittingRequest(false);
  }, []);

  const handleSubmitResourceRequest = useCallback(
    async (formData) => {
      if (!user?.email || !projectId || !userToRequest) {
        toast.error("Missing data for resource request.");
        return;
      }
      setIsSubmittingRequest(true);

      try {
        await createResourceRequest({
          projectId,
          requestedUserId: userToRequest._id,
          requestedRole: formData.requestedRole,
          requestedPercentage: formData.requestedPercentage,
          requestedStartDate: formData.requestedStartDate,
          requestedEndDate: formData.requestedEndDate,
          pmNotes: formData.pmNotes,
        });

        toast.success(
          `Request for ${userToRequest.name} submitted successfully!`
        );
        handleCloseRequestModal();
      } catch (err) {
        console.error("Error submitting resource request:", err);
        toast.error(err.message || "Failed to submit request.");
      } finally {
        setIsSubmittingRequest(false);
      }
    },
    [
      user?.email,
      projectId,
      userToRequest,
      createResourceRequest,
      handleCloseRequestModal,
    ]
  );

  // --- Derived State ---
  const loading =
    project === undefined ||
    allocations === undefined ||
    utilization === undefined;

  const canManageTeam =
    user &&
    project &&
    (project.pmId === user._id || ["admin", "hr"].includes(user.role));

  return {
    // Project Data
    project,
    allocations: allocations?.data || [],
    utilization: utilization?.utilization,
    loading,
    error: null, // Convex handles errors internally

    // Tasks
    tasks,
    onCreateTask: handleCreateTask,
    onUpdateTask: handleUpdateTask,
    onDeleteTask: handleDeleteTask,

    // Recommendations
    recommendedUsers,
    loadingRecommendations,
    recommendationError,
    showRecommendations,
    handleFetchRecommendations,

    // Resource Requests
    isRequestModalOpen,
    isSubmittingRequest,
    userToRequest,
    handleInitiateResourceRequest,
    handleCloseRequestModal,
    handleSubmitResourceRequest,

    // Permissions
    canManageTeam,
  };
};
