"use client";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useNotificationsPage } from "@/lib/hooks/useNotificationsPage";
import { NotificationRow } from "@/components/notifications/NotificationRow";

const NotificationsPage = () => {
  const {
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
    hasActiveFilters,
    hasUnreadSelected,
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
  } = useNotificationsPage();

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={30} />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return null;
  }

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
                onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                className="px-3 py-2 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
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
                  <Button
                    onClick={() =>
                      handleMarkAsRead(Array.from(selectedNotifications).filter(id => {
                        const notification = notifications.find(n => n._id === id);
                        return notification && !notification.isRead;
                      }))
                    }
                    disabled={bulkActionLoading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {bulkActionLoading ? (
                      <LoadingSpinner size={16} />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Mark as Read
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(Array.from(selectedNotifications))}
                  disabled={bulkActionLoading}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
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
                <Button
                  onClick={() =>
                    handleMarkAsRead(
                      notifications.filter((n) => !n.isRead).map((n) => n._id)
                    )
                  }
                  disabled={bulkActionLoading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Mark all as read</span>
                  <span className="sm:hidden">Mark all</span>
                </Button>
              )}
            </div>
          </div>

          {/* Notifications Content */}
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
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
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
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              <span className="px-3 py-1 text-sm whitespace-nowrap">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;