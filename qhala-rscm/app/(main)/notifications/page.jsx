"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useEnhancedNotifications } from "@/lib/hooks/useEnhancedNotifications";
import EnhancedNotificationRow from "@/components/notifications/EnhancedNotificationRow";
import NotificationFilters from "@/components/notifications/NotificationFilters";
import NotificationStats from "@/components/notifications/NotificationStats";

const EnhancedNotificationsPage = () => {
  const router = useRouter();

  const {
    // Data
    notifications,
    summaryStats,
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

    // Error state
    error,
  } = useEnhancedNotifications();

  // Event handlers for notification interactions
  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    // Navigate to link if available
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleActionClick = (notification) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.link) {
      router.push(notification.link);
    }
  };

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

  const itemsPerPage = 20;

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="h-8 w-8 text-[rgb(var(--primary))]" />
              <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="bg-[rgb(var(--primary))] text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-[rgb(var(--muted-foreground))]">
              Stay updated with your activities and approvals
            </p>
          </div>

          <div className="flex items-center gap-3">
            {notifications.some((n) => !n.isRead) && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={bulkActionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => router.push("/settings/notifications")}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        <NotificationStats
          summaryStats={summaryStats}
          loading={loading}
          showDetailed={false}
        />

        {/* Advanced Filters */}
        <NotificationFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />

        {/* Bulk Actions */}
        {hasSelectedNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--primary-accent-background))] border border-[rgb(var(--primary))] rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[rgb(var(--primary))]">
                {selectedNotifications.size} notification
                {selectedNotifications.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                {hasUnreadSelected && (
                  <Button
                    onClick={handleBulkMarkAsRead}
                    disabled={bulkActionLoading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {bulkActionLoading ? (
                      <LoadingSpinner size={16} />
                    ) : (
                      <CheckCheck className="h-4 w-4 mr-2" />
                    )}
                    Mark as Read
                  </Button>
                )}
                <Button
                  onClick={handleBulkArchive}
                  disabled={bulkActionLoading}
                  size="sm"
                  variant="outline"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button
                  onClick={handleBulkDelete}
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
        <Card>
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
                  {notifications.length > 0
                    ? `Select All (${notifications.length})`
                    : "Select All"}
                </span>
              </div>

              <div className="text-sm text-[rgb(var(--muted-foreground))]">
                {totalCount > 0 && (
                  <span>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                    {totalCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notifications Content */}
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <LoadingSpinner size={30} />
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-12 w-12 text-[rgb(var(--muted-foreground))] mx-auto mb-4" />
                <p className="text-[rgb(var(--muted-foreground))] text-lg mb-2">
                  {hasActiveFilters
                    ? "No notifications match your filters"
                    : "No notifications found"}
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
                    <EnhancedNotificationRow
                      key={notification._id}
                      notification={notification}
                      isSelected={selectedNotifications.has(notification._id)}
                      onSelect={handleSelectNotification}
                      onClick={handleNotificationClick}
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAsUnread={handleMarkAsUnread}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onActionClick={handleActionClick}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

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

export default EnhancedNotificationsPage;
