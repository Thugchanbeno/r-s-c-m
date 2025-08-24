import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export const useNotificationsPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  // State management
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Filtering
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    dateRange: "all",
  });

  // Debounced search
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (page = currentPage, showSpinner = true) => {
      if (sessionStatus !== "authenticated") return;

      if (showSpinner) setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
          status: filters.status,
          search: filters.search,
          dateRange: filters.dateRange,
        });

        const response = await fetch(`/api/notifications?${params}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch notifications");
        }

        const result = await response.json();
        if (result.success) {
          setNotifications(result.data);
          setCurrentPage(result.currentPage);
          setTotalPages(result.totalPages);
          setTotalCount(result.totalCount);
        } else {
          throw new Error(result.error || "Could not load notifications.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setNotifications([]);
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [sessionStatus, filters, currentPage, itemsPerPage]
  );

  // Effects
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchNotifications(1);
    }
  }, [sessionStatus, filters]);

  // Handlers
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead([notification._id]);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAsRead = async (notificationIds) => {
    try {
      setBulkActionLoading(true);
      const response = await fetch("/api/notifications/mark-as-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to mark as read");
      }
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n._id) ? { ...n, isRead: true } : n
        )
      );
      setSelectedNotifications(new Set());
      toast.success(result.message || "Notifications marked as read");
    } catch (err) {
      console.error("Mark as read error:", err);
      toast.error(err.message || "Failed to mark notifications as read");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDelete = async (notificationIds) => {
    if (!confirm(`Are you sure you want to delete ${notificationIds.length} notification${notificationIds.length > 1 ? 's' : ''}?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      const response = await fetch("/api/notifications/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete notifications");
      }

      setNotifications((prev) =>
        prev.filter((n) => !notificationIds.includes(n._id))
      );
      setSelectedNotifications(new Set());
      toast.success(result.message || "Notifications deleted");
      
      if (notifications.length === notificationIds.length && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchNotifications(currentPage, false);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete notifications");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map((n) => n._id)));
    }
  };

  const handleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchNotifications(page);
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      search: "",
      dateRange: "all",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Computed values
  const hasActiveFilters = filters.status !== "all" || filters.search !== "" || filters.dateRange !== "all";
  const hasUnreadSelected = Array.from(selectedNotifications).some(id => {
    const notification = notifications.find(n => n._id === id);
    return notification && !notification.isRead;
  });

  return {
    // State
    notifications,
    loading,
    error,
    selectedNotifications,
    bulkActionLoading,
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage,
    filters,
    searchTerm,
    sessionStatus,
    
    // Computed values
    hasActiveFilters,
    hasUnreadSelected,
    
    // Handlers
    handleNotificationClick,
    handleMarkAsRead,
    handleDelete,
    handleSelectAll,
    handleSelectNotification,
    handleFilterChange,
    handlePageChange,
    clearFilters,
    setSearchTerm,
    fetchNotifications,
  };
};