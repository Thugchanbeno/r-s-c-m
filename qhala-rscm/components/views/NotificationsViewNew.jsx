"use client";
import { useState } from "react";
import { Bell, CheckCheck, Trash2, Archive, Filter, X } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import NotificationCardNew from "@/components/notifications/NotificationCardNew";
import { useEnhancedNotifications } from "@/lib/hooks/useEnhancedNotifications";
import { toast } from "sonner";

const NotificationsViewNew = () => {
  const {
    notifications,
    loading,
    unreadCount,
    totalCount,
    currentPage,
    totalPages,
    selectedNotifications,
    hasSelectedNotifications,
    hasUnreadSelected,
    filters,
    searchTerm,
    handleSearchChange,
    handleFilterChange,
    clearFilters,
    handleSelectAll,
    handleSelectNotification,
    handleMarkAsRead,
    handleMarkAsUnread,
    handleArchive,
    handleDelete,
    handleBulkMarkAsRead,
    handleBulkArchive,
    handleBulkDelete,
    handleMarkAllAsRead,
    handlePageChange,
    bulkActionLoading,
  } = useEnhancedNotifications();

  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.category !== "all" ||
    filters.priority !== "all" ||
    filters.status !== "all" ||
    searchTerm.trim() !== "";

  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner width={200} height={4} />
        <p className="text-sm text-rscm-dark-purple">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rscm-lilac/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-rscm-violet" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-rscm-dark-purple">
                Notifications
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={bulkActionLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rscm-violet rounded-lg hover:bg-rscm-plum transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-rscm-violet text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && !showFilters && (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
              />

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="px-3 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-rscm-violet/20 focus:bg-white outline-none"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {hasSelectedNotifications && (
        <div className="bg-rscm-lilac/20 border border-rscm-lilac rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-rscm-dark-purple">
              {selectedNotifications.size} notification
              {selectedNotifications.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              {hasUnreadSelected && (
                <button
                  onClick={handleBulkMarkAsRead}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-rscm-violet rounded-md hover:bg-rscm-plum transition-colors disabled:opacity-50"
                >
                  {bulkActionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  Mark Read
                </button>
              )}
              <button
                onClick={handleBulkArchive}
                disabled={bulkActionLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select All */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                notifications.length > 0 &&
                selectedNotifications.size === notifications.length
              }
              onChange={handleSelectAll}
              className="w-4 h-4 text-rscm-violet focus:ring-2 focus:ring-rscm-violet/20 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All ({notifications.length})
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Showing {totalCount} notification{totalCount !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm px-6 py-12 text-center">
          <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-sm font-semibold text-rscm-dark-purple mb-1">
            {hasActiveFilters ? "No matching notifications" : "No notifications"}
          </h3>
          <p className="text-xs text-gray-600">
            {hasActiveFilters
              ? "Try adjusting your filters"
              : "You're all caught up!"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-rscm-violet rounded-lg hover:bg-rscm-plum transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationCardNew
              key={notification._id}
              notification={notification}
              isSelected={selectedNotifications.has(notification._id)}
              onSelect={handleSelectNotification}
              onMarkAsRead={handleMarkAsRead}
              onMarkAsUnread={handleMarkAsUnread}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsViewNew;
