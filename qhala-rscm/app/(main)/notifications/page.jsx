"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";

const NotificationsPage = () => {
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
    status: "all", // all, read, unread
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

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={30} />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const hasActiveFilters = filters.status !== "all" || filters.search !== "" || filters.dateRange !== "all";

  const hasUnreadSelected = Array.from(selectedNotifications).some(id => {
    const notification = notifications.find(n => n._id === id);
    return notification && !notification.isRead;
  });

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-8 w-8 text-[rgb(var(--primary))]" />
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
              Notifications
            </h1>
          </div>
          <p className="text-[rgb(var(--muted-foreground))]">
            Manage your notifications and stay updated
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-2 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              {/* Date Range Filter */}
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
                className="px-3 py-2 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Clear Filters - Blue */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
        {selectedNotifications.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--primary-accent-background))] border border-[rgb(var(--primary))] rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[rgb(var(--primary))]">
                {selectedNotifications.size} notification
                {selectedNotifications.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                {hasUnreadSelected && (
                  <button
                    onClick={() =>
                      handleMarkAsRead(Array.from(selectedNotifications).filter(id => {
                        const notification = notifications.find(n => n._id === id);
                        return notification && !notification.isRead;
                      }))
                    }
                    disabled={bulkActionLoading}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 border border-green-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkActionLoading ? (
                      <LoadingSpinner size={16} />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() =>
                    handleDelete(Array.from(selectedNotifications))
                  }
                  disabled={bulkActionLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 border border-red-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications List */}
        <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] overflow-hidden">
          {/* List Header */}
          <div className="border-b border-[rgb(var(--border))] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    notifications.length > 0 &&
                    selectedNotifications.size === notifications.length
                  }
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[rgb(var(--primary))] focus:ring-[rgb(var(--ring))] border-[rgb(var(--border))] rounded"
                />
                <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                  Select All
                </span>
              </div>
              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={() =>
                    handleMarkAsRead(
                      notifications.filter((n) => !n.isRead).map((n) => n._id)
                    )
                  }
                  disabled={bulkActionLoading}
                  className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 border border-green-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Mark all as read</span>
                  <span className="sm:hidden">Mark all as read</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications */}
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner size={30} />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => fetchNotifications()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-[rgb(var(--muted-foreground))] mx-auto mb-4" />
              <p className="text-[rgb(var(--muted-foreground))] text-lg mb-2">
                {hasActiveFilters ? "No notifications match your filters" : "No notifications found"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--border))]">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <NotificationRow
                    key={notification._id}
                    notification={notification}
                    isSelected={selectedNotifications.has(notification._id)}
                    onSelect={() => handleSelectNotification(notification._id)}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={() => handleMarkAsRead([notification._id])}
                    onDelete={() => handleDelete([notification._id])}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] text-center sm:text-left">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{" "}
              results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm whitespace-nowrap">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                rightIcon={<ChevronRight className="h-4 w-4" />}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationRow = ({
  notification,
  isSelected,
  onSelect,
  onClick,
  onMarkAsRead,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  useEffect(() => {
    const handleClickOutside = () => setShowActions(false);
    if (showActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "p-4 hover:bg-[rgb(var(--muted))] transition-colors duration-150 relative",
        !notification.isRead && "bg-[rgba(var(--primary-accent-background),0.3)]"
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="mt-1 h-4 w-4 text-[rgb(var(--primary))] focus:ring-[rgb(var(--ring))] border-[rgb(var(--border))] rounded"
        />
        
        <div className="flex-1 cursor-pointer" onClick={onClick}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p
                className={cn(
                  "text-sm break-words",
                  !notification.isRead
                    ? "font-semibold text-[rgb(var(--primary))]"
                    : "text-[rgb(var(--foreground))]"
                )}
              >
                {notification.message}
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                {timeAgo}
              </p>
            </div>
            
            {!notification.isRead && (
              <div className="ml-2 h-2 w-2 bg-[rgb(var(--primary))] rounded-full flex-shrink-0" />
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1 hover:bg-[rgb(var(--muted))] rounded-full transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-md shadow-lg z-10 min-w-[150px]">
              
              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 text-green-700 hover:text-green-800 flex items-center gap-2 transition-colors duration-200"
                >
                  <Check className="h-4 w-4" />
                  Mark as read
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-700 hover:text-red-800 flex items-center gap-2 transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationsPage;