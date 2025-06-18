import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

export const useProjectDetailsData = (projectId) => {
  const { data: session } = useSession();

  const [project, setProject] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [userToRequest, setUserToRequest] = useState(null);

  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const fetchProjectData = useCallback(async () => {
    if (!projectId) {
      setError("Project ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [projectResponse, allocationsResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/allocations?projectId=${projectId}`),
      ]);

      if (!projectResponse.ok) {
        const errData = await projectResponse.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            `Failed to fetch project: ${projectResponse.statusText} (${projectResponse.status})`
        );
      }
      const projectResult = await projectResponse.json();
      if (projectResult.success && projectResult.data) {
        setProject(projectResult.data);
      } else {
        throw new Error(
          projectResult.error || "Invalid project data received."
        );
      }

      if (!allocationsResponse.ok) {
        const errData = await allocationsResponse.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            `Failed to fetch allocations: ${allocationsResponse.statusText} (${allocationsResponse.status})`
        );
      }
      const allocationsResult = await allocationsResponse.json();
      if (allocationsResult.success && Array.isArray(allocationsResult.data)) {
        setAllocations(allocationsResult.data);
      } else {
        throw new Error(
          allocationsResult.error || "Invalid allocations data received."
        );
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
      setError(err.message || "Could not load project details.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, fetchProjectData]);

  const handleFetchRecommendations = useCallback(async () => {
    if (!projectId) return;
    setLoadingRecommendations(true);
    setRecommendationError(null);
    setRecommendedUsers([]);
    setShowRecommendations(true);

    try {
      const response = await fetch(
        `/api/recommendations/users?projectId=${projectId}&limit=5`
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch recommendations.");
      }
      setRecommendedUsers(result.data || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setRecommendationError(err.message);
      setRecommendedUsers([]);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [projectId]);

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
    async (formDataFromForm) => {
      if (!userToRequest || !project) {
        toast.error("User or project data is missing for the request.");
        return;
      }
      setIsSubmittingRequest(true);

      const payload = {
        projectId: project._id,
        requestedUserId: userToRequest._id,
        requestedRole: formDataFromForm.requestedRole,
        requestedPercentage: formDataFromForm.requestedPercentage,
        requestedStartDate: formDataFromForm.requestedStartDate,
        requestedEndDate: formDataFromForm.requestedEndDate,
        pmNotes: formDataFromForm.pmNotes,
        // requestedByPmId will be set on the backend using session
      };

      try {
        const response = await fetch("/api/resourcerequests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to submit request");
        }
        toast.success(
          `Request for ${userToRequest.name} submitted successfully!`
        );
        handleCloseRequestModal();
      } catch (error) {
        console.error("Error submitting resource request:", error);
        toast.error(`Error: ${error.message || "Could not submit request."}`);
      } finally {
        setIsSubmittingRequest(false);
      }
    },
    [userToRequest, project, handleCloseRequestModal]
  );

  const canManageTeam =
    session?.user &&
    project &&
    (session.user.id === project.pmId?._id ||
      session.user.role === "admin" ||
      session.user.role === "hr");

  return {
    project,
    allocations,
    loading,
    error,
    isRequestModalOpen,
    isSubmittingRequest,
    userToRequest,
    recommendedUsers,
    loadingRecommendations,
    recommendationError,
    showRecommendations,
    session,
    canManageTeam,
    fetchProjectData,
    handleFetchRecommendations,
    handleInitiateResourceRequest,
    handleCloseRequestModal,
    handleSubmitResourceRequest,
  };
};
