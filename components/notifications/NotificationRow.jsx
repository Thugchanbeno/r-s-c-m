// components/notifications/NotificationRow.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Check, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const NotificationRow = ({
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
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1 h-auto"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-md shadow-lg z-10 min-w-[150px]">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead();
                    setShowActions(false);
                  }}
                  className="w-full justify-start text-green-700 hover:text-green-800 hover:bg-green-50"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowActions(false);
                }}
                className="w-full justify-start text-red-700 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};