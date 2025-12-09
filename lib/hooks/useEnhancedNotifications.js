import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

export const useEnhancedNotifications = () => {
  const { data: session, status: sessionStatus } = useSession();
  
  // State management
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  const itemsPerPage = 20;

  // Convex queries
  const notificationsData = useQuery(
    api.notifications.getAll,
    sessionStatus === "authenticated" && session?.user?.email
      ? {
          email: session.user.email,
          page: currentPage,
          limit: itemsPerPage,
          status: filters.status,
          category: filters.category,
          priority: filters.priority,
          requiresAction: filters.requiresAction,
          search: searchTerm,
          dateRange: filters.dateRange,
        }
      : "skip"
  );

  const summaryStats = useQuery(
    api.notifications.getSummaryStats,
    sessionStatus === "authenticated" && session?.user?.email
      ? { email: session.user.email }
      : "skip"
  );

  const actionRequiredNotifications = useQuery(
    api.notifications.getActionRequired,
    sessionStatus === "authenticated" && session?.user?.email
      ? { email: session.user.email, limit: 10 }
      : "skip"
  );

  // Convex mutations
  const markAsReadMutation = useMutation(api.notifications.markAsRead);
  const updateNotificationMutation = useMutation(api.notifications.update);
  const deleteNotificationsMutation = useMutation(api.notifications.remove);

  // Derived state
  const loading = notificationsData === undefined || summaryStats === undefined;
  const notifications = notificationsData?.data || [];
  const totalCount = notificationsData?.totalCount || 0;
  const totalPages = notificationsData?.totalPages || 1;
  const unreadCount = notificationsData?.unreadCount || 0;
  
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value && value !== "all" && value !== ""
    ) || searchTerm !== "";
  }, [filters, searchTerm]);

  const hasSelectedNotifications = selectedNotifications.size > 0;
  
  const hasUnreadSelected = useMemo(() => {
    return Array.from(selectedNotifications).some(id => {
      const notification = notifications.find(n => n._id === id);
      return notification && !notification.isRead;
    });
  }, [selectedNotifications, notifications]);

  // Filter handlers
  const handleFilterChange = useCallback((type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ status: "all", dateRange: "all" });
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n._id)));
    }
  }, [selectedNotifications.size, notifications]);

  const handleSelectNotification = useCallback((id) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Notification actions
  const handleMarkAsRead = useCallback(async (notificationIds) => {
    if (!session?.user?.email) return;
    
    setBulkActionLoading(true);
    try {
      await markAsReadMutation({
        email: session.user.email,
        notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds],
      });
      toast.success(
        Array.isArray(notificationIds) && notificationIds.length > 1
          ? "Notifications marked as read"
          : "Notification marked as read"
      );
    } catch (error) {
      toast.error("Failed to mark notifications as read");
      console.error("Mark as read error:", error);
    } finally {
      setBulkActionLoading(false);
    }
  }, [session?.user?.email, markAsReadMutation]);

  const handleMarkAsUnread = useCallback(async (notificationId) => {
    if (!session?.user?.email) return;
    
    try {
      await updateNotificationMutation({
        email: session.user.email,
        id: notificationId,
        isRead: false,
      });
      toast.success("Notification marked as unread");
    } catch (error) {
      toast.error("Failed to mark notification as unread");
      console.error("Mark as unread error:", error);
    }
  }, [session?.user?.email, updateNotificationMutation]);

  const handleArchive = useCallback(async (notificationIds) => {
    if (!session?.user?.email) return;
    
    setBulkActionLoading(true);
    try {
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      // Archive each notification individually
      for (const id of ids) {
        await updateNotificationMutation({
          email: session.user.email,
          id,
          isArchived: true,
        });
      }
      
      // Clear selections
      setSelectedNotifications(new Set());
      
      toast.success(
        ids.length > 1 ? "Notifications archived" : "Notification archived"
      );
    } catch (error) {
      toast.error("Failed to archive notifications");
      console.error("Archive error:", error);
    } finally {
      setBulkActionLoading(false);
    }
  }, [session?.user?.email, updateNotificationMutation]);

  const handleDelete = useCallback(async (notificationIds) => {
    if (!session?.user?.email) return;
    
    setBulkActionLoading(true);
    try {
      await deleteNotificationsMutation({
        email: session.user.email,
        notificationIds: Array.isArray(notificationIds) ? notificationIds : [notificationIds],
      });
      
      // Clear selections
      setSelectedNotifications(new Set());
      
      toast.success(
        Array.isArray(notificationIds) && notificationIds.length > 1
          ? "Notifications deleted"
          : "Notification deleted"
      );
    } catch (error) {
      toast.error("Failed to delete notifications");
      console.error("Delete error:", error);
    } finally {
      setBulkActionLoading(false);
    }
  }, [session?.user?.email, deleteNotificationsMutation]);

  // Pagination handlers
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [totalPages, currentPage]);

  // Bulk actions for selected notifications
  const handleBulkMarkAsRead = useCallback(() => {
    const unreadIds = Array.from(selectedNotifications).filter(id => {
      const notification = notifications.find(n => n._id === id);
      return notification && !notification.isRead;
    });
    
    if (unreadIds.length > 0) {
      handleMarkAsRead(unreadIds);
    }
  }, [selectedNotifications, notifications, handleMarkAsRead]);

  const handleBulkArchive = useCallback(() => {
    if (selectedNotifications.size > 0) {
      handleArchive(Array.from(selectedNotifications));
    }
  }, [selectedNotifications, handleArchive]);

  const handleBulkDelete = useCallback(() => {
    if (selectedNotifications.size > 0) {
      handleDelete(Array.from(selectedNotifications));
    }
  }, [selectedNotifications, handleDelete]);

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(() => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
    if (unreadIds.length > 0) {
      handleMarkAsRead(unreadIds);
    }
  }, [notifications, handleMarkAsRead]);

  // Get notifications by category for quick filtering
  const getNotificationsByCategory = useCallback((category) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  // Get notifications by priority for quick filtering
  const getNotificationsByPriority = useCallback((priority) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  // Error handling
  const error = null; // Convex handles errors internally

  return {
    // Data
    notifications,
    summaryStats,
    actionRequiredNotifications,
    totalCount,
    totalPages,
    currentPage,
    unreadCount,
    
    // Loading states
    loading,
    bulkActionLoading,
    sessionStatus,
    
    // Filters and search
    searchTerm,
    filters,
    hasActiveFilters,
    
    // Selection
    selectedNotifications,
    hasSelectedNotifications,
    hasUnreadSelected,
    
    // Filter handlers
    handleFilterChange,
    clearFilters,
    handleSearchChange,
    
    // Selection handlers
    handleSelectAll,
    handleSelectNotification,
    
    // Individual actions
    handleMarkAsRead,
    handleMarkAsUnread,
    handleArchive,
    handleDelete,
    
    // Bulk actions
    handleBulkMarkAsRead,
    handleBulkArchive,
    handleBulkDelete,
    handleMarkAllAsRead,
    
    // Pagination
    handlePageChange,
    
    // Utility functions
    getNotificationsByCategory,
    getNotificationsByPriority,
    
    // Error state
    error,
  };
};