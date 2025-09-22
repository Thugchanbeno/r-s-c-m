import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/hooks/useAuth";

const ITEMS_PER_PAGE = 10;

export function useAllocations() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  // Convex Queries
  const allocationsData = useQuery(
    api.allocations.getAll,
    user?.email ? {
      email: user.email,
      page: currentPage,
      limit: ITEMS_PER_PAGE
    } : "skip"
  );

  const usersList = useQuery(
    api.users.getAll,
    user?.email ? { email: user.email, limit: 1000 } : "skip"
  );

  const projectsList = useQuery(
    api.projects.getAll,
    user?.email ? { email: user.email } : "skip"
  );

  // Convex Mutations
  const createAllocation = useMutation(api.allocations.create);
  const updateAllocation = useMutation(api.allocations.update);
  const deleteAllocation = useMutation(api.allocations.remove);

  // State for CRUD operations
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Derived state from Convex queries
  const allocations = allocationsData?.data || [];
  const totalPages = allocationsData?.totalPages || 1;
  const totalAllocations = allocationsData?.totalAllocations || 0;
  const loading = allocationsData === undefined;
  const loadingDropdowns = usersList === undefined || projectsList === undefined;
  const dropdownError = null; // Convex handles errors internally

  // No longer needed - data comes from Convex queries

  // No longer needed - Convex queries handle data fetching automatically

  // No longer needed - Convex queries are reactive

  const goToPage = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= totalPages &&
      newPage !== currentPage &&
      !loading
    ) {
      setCurrentPage(newPage);
    }
  };

  const selectAllocationForEdit = (allocation) => {
    setEditingAllocation(allocation);
  };

  const clearEditingAllocation = () => {
    setEditingAllocation(null);
  };

  const submitAllocation = async (formData) => {
    if (!user?.email) {
      toast.error("User not authenticated");
      return { success: false, error: "Not authenticated" };
    }

    setIsProcessingAction(true);
    setError(null);
    const isEditing = !!editingAllocation;

    // Convert date strings to timestamps for Convex
    const processedFormData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).getTime() : null,
      endDate: formData.endDate ? new Date(formData.endDate).getTime() : null,
    };

    try {
      if (isEditing) {
        await updateAllocation({
          email: user.email,
          id: editingAllocation._id,
          ...processedFormData,
        });
      } else {
        await createAllocation({
          email: user.email,
          ...processedFormData,
        });
      }
      
      toast.success(
        `Allocation ${isEditing ? "updated" : "created"} successfully!`
      );
      clearEditingAllocation();
      return { success: true };
    } catch (err) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} allocation:`,
        err
      );
      toast.error(
        err.message ||
          `Could not ${isEditing ? "update" : "create"} allocation.`
      );
      return { success: false, error: err.message };
    } finally {
      setIsProcessingAction(false);
    }
  };

  const removeAllocationAPI = async (allocationId) => {
    if (!allocationId || !user?.email) {
      toast.error("Cannot delete: Invalid allocation ID or not authenticated");
      return { success: false, error: "Invalid allocation ID or not authenticated" };
    }
    setIsProcessingAction(true);
    setError(null);
    try {
      await deleteAllocation({ email: user.email, id: allocationId });
      toast.success("Allocation deleted successfully!");
      return { success: true };
    } catch (err) {
      console.error("Error deleting allocation:", err);
      toast.error(err.message || "Could not delete allocation.");
      return { success: false, error: err.message };
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteClick = (allocationId) => {
    if (confirmDeleteId === allocationId) {
      removeAllocationAPI(allocationId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(allocationId);
    }
  };

  const cancelDeleteConfirmation = () => {
    setConfirmDeleteId(null);
  };
  return {
    allocations,
    loading,
    error,
    setError,
    currentPage,
    totalPages,
    totalAllocations,
    goToPage,

    usersList,
    projectsList,
    loadingDropdowns,
    dropdownError,

    editingAllocation,
    isProcessingAction,
    selectAllocationForEdit,
    clearEditingAllocation,
    submitAllocation,

    confirmDeleteId,
    handleDeleteClick,
    cancelDeleteConfirmation,
  };
}
