"use client";
import { useState, useEffect, useCallback } from "react";
import NotificationItem from "@/components/user/NotificationItem";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import { AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const NotificationDropdown = ({
  isOpen,
  onClose,
  onMarkAllReadSuccess,
  onNotificationRead,
}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(
    async (showSpinner = true) => {
      if (!isOpen) return;

      if (showSpinner) {
        setLoading(true);
      }
      setError(null);
      try {
        const response = await fetch("/api/notifications?limit=7");
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const result = await response.json();
        if (result.success) {
          setNotifications(result.data);
          // setCurrentPage(result.currentPage);
          // setTotalPages(result.totalPages);
          if (onNotificationRead && typeof result.unreadCount === "number") {
            // If parent needs to know new unread count
            onNotificationRead(result.unreadCount);
          }
        } else {
          throw new Error(result.error || "Could not load notifications.");
        }
      } catch (err) {
        setError(err.message);
        setNotifications([]);
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [isOpen, onNotificationRead]
  );

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-as-read", {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to mark notifications as read."
        );
      }
      toast.success(result.message || "All notifications marked as read!");
      fetchNotifications(false);
      if (onMarkAllReadSuccess) onMarkAllReadSuccess();
    } catch (err) {
      toast.error(err.message || "Could not mark all as read.");
      console.error("Error marking all as read:", err);
    }
  };
  const handleMarkOneAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to mark notification as read.");
      }
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      if (onNotificationRead) {
        fetchNotifications(false);
      }
    } catch (err) {
      toast.error(err.message || "Could not mark notification as read.");
      console.error(
        `Error marking notification ${notificationId} as read:`,
        err
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-y-auto
                 bg-[rgb(var(--card))] rounded-md shadow-xl border border-[rgb(var(--border))] z-50"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dropdown
    >
      <div className="p-3 border-b border-[rgb(var(--border))] flex justify-between items-center sticky top-0 bg-[rgb(var(--card))] z-10">
        <h3 className="text-base font-semibold text-[rgb(var(--foreground))]">
          Notifications
        </h3>
        {notifications.some((n) => !n.isRead) && ( // Show only if there are unread messages
          <Button
            variant="outline"
            size="xs"
            onClick={handleMarkAllRead}
            className="text-[rgb(var(--primary))]"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="p-10 text-center">
          <LoadingSpinner size={20} />
        </div>
      ) : error ? (
        <p className="p-4 text-sm text-red-600 text-center">{error}</p>
      ) : notifications.length === 0 ? (
        <p className="p-6 text-sm text-center text-[rgb(var(--muted-foreground))]">
          No new notifications.
        </p>
      ) : (
        <ul className="divide-y divide-[rgb(var(--border))]">
          <ul className="divide-y divide-[rgb(var(--border))]">
            <AnimatePresence>
              {notifications.map((notif) => (
                <NotificationItem
                  key={notif._id}
                  notification={notif}
                  onMarkAsRead={handleMarkOneAsRead} // Pass the new handler
                />
              ))}
            </AnimatePresence>
          </ul>
        </ul>
      )}
      {/* Optional: View All / Pagination Footer */}
      {/* <div className="p-2 text-center border-t border-[rgb(var(--border))]">
        <Link href="/notifications" className="text-sm text-[rgb(var(--primary))] hover:underline">
          View all notifications
        </Link>
      </div> */}
    </div>
  );
};

export default NotificationDropdown;
