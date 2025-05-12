import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

export function useAllocations() {
  // State for Allocation List
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAllocations, setTotalAllocations] = useState(0);

  // State for Form Dropdown Data
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [dropdownError, setDropdownError] = useState(null);

  // State for CRUD operations
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Fetch Allocation List Data
  const fetchAllocations = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      if (page !== currentPage) {
        setAllocations([]);
      }
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });
        const response = await fetch(`/api/allocations?${params.toString()}`);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error ||
              `Failed to fetch allocations: ${response.statusText}`
          );
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setAllocations(result.data);
          setCurrentPage(result.currentPage);
          setTotalPages(result.totalPages);
          setTotalAllocations(result.totalAllocations);
        } else {
          throw new Error(
            result.error || "Invalid data format for allocations."
          );
        }
      } catch (err) {
        console.error("Error fetching allocations:", err);
        setError(err.message || "Could not load allocations.");
        setAllocations([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalAllocations(0);
      } finally {
        setLoading(false);
      }
    },
    [currentPage]
  );

  // Fetch Dropdown Data (Users & Projects)
  const fetchDropdownData = useCallback(async () => {
    setLoadingDropdowns(true);
    setDropdownError(null);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        fetch("/api/users?limit=100"),
        fetch("/api/projects?limit=100&status=Active"),
      ]);

      // Process Users
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData = await usersRes.json();
      if (usersData.success && Array.isArray(usersData.data)) {
        setUsersList(usersData.data);
      } else {
        throw new Error(usersData.error || "Invalid users data");
      }

      // Process Projects
      if (!projectsRes.ok) throw new Error("Failed to fetch projects");
      const projectsData = await projectsRes.json();
      if (projectsData.success && Array.isArray(projectsData.data)) {
        setProjectsList(projectsData.data);
      } else {
        throw new Error(projectsData.error || "Invalid projects data");
      }
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      setDropdownError(
        err.message || "Could not load users or projects for selection."
      );
      setUsersList([]);
      setProjectsList([]);
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  // Effect for fetching allocation list
  useEffect(() => {
    fetchAllocations(currentPage);
  }, [currentPage, fetchAllocations]);

  // Effect for fetching dropdown data (runs once on hook mount)
  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  //  CRUD and Pagination Functions
  const refetchAllocations = useCallback(() => {
    fetchAllocations(currentPage);
  }, [currentPage, fetchAllocations]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
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
    setIsProcessingAction(true);
    setError(null);
    const isEditing = !!editingAllocation;
    const endpoint = isEditing
      ? `/api/allocations/${editingAllocation._id}`
      : "/api/allocations";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            `Failed to ${isEditing ? "update" : "create"} allocation.`
        );
      }
      toast.success(
        `Allocation ${isEditing ? "updated" : "created"} successfully!`
      );
      refetchAllocations();
      clearEditingAllocation();
      return { success: true };
    } catch (err) {
      console.error(
        `Error ${isEditing ? "submitting" : "creating"} allocation:`,
        err
      );
      toast.error(
        err.message ||
          `Could not ${isEditing ? "submit" : "create"} allocation.`
      );
      // Set main error state if needed, or rely on toast
      // setError(err.message || `Could not ${isEditing ? "submit" : "create"} allocation.`);
      return { success: false, error: err.message };
    } finally {
      setIsProcessingAction(false);
    }
  };

  const removeAllocation = async (allocationId) => {
    if (!allocationId) {
      toast.error("Cannot delete: Invalid allocation ID");
      return { success: false, error: "Invalid allocation ID" };
    }
    setIsProcessingAction(true);
    setError(null);
    try {
      const response = await fetch(`/api/allocations/${allocationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete allocation");
      }
      toast.success(data.message || "Allocation deleted successfully");
      refetchAllocations();
      return { success: true };
    } catch (err) {
      console.error("Error deleting allocation:", err);
      toast.error(err.message || "Failed to delete allocation");
      return { success: false, error: err.message };
    } finally {
      setIsProcessingAction(false);
    }
  };
  return {
    // Allocation List Data & State
    allocations,
    loading,
    error,
    currentPage,
    totalPages,
    totalAllocations,
    goToPage,
    refetchAllocations,
    setError,

    // Form Dropdown Data & State
    usersList,
    projectsList,
    loadingDropdowns,
    dropdownError,

    // CRUD related state and functions
    editingAllocation,
    isProcessingAction,
    selectAllocationForEdit,
    clearEditingAllocation,
    submitAllocation,
    removeAllocation,
  };
}
