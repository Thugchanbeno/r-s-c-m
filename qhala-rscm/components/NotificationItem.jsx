"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const router = useRouter();
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const handleClick = async () => {
    if (!notification.isRead && onMarkAsRead) {
      await onMarkAsRead(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    // Parent (NotificationDropdown) will handle closing itself if needed
  };

  const content = (
    <div
      className={`p-3 hover:bg-[rgba(var(--primary-accent-background),0.5)] transition-colors duration-150 cursor-pointer ${
        !notification.isRead
          ? "bg-[rgb(var(--primary-accent-background))]"
          : "bg-transparent"
      }`}
      onClick={handleClick}
    >
      <p
        className={`text-sm ${
          !notification.isRead
            ? "font-semibold text-[rgb(var(--primary))]"
            : "text-[rgb(var(--foreground))]"
        }`}
      >
        {notification.message}
      </p>
      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
        {timeAgo}
      </p>
    </div>
  );

  return (
    <motion.li
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
      onClick={handleClick}
    >
      <div
        className={`p-3 transition-colors duration-150 ${
          !notification.isRead
            ? "bg-[rgba(var(--primary-accent-background),0.7)] hover:bg-[rgba(var(--primary-accent-background),1)]"
            : "hover:bg-[rgb(var(--muted))]"
        }`}
      >
        <p
          className={`text-sm break-words ${
            !notification.isRead
              ? "font-semibold text-[rgb(var(--primary))]"
              : "text-[rgb(var(--foreground))]"
          }`}
        >
          {notification.message}
        </p>
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          {timeAgo}
        </p>
      </div>
    </motion.li>
  );
};

export default NotificationItem;
