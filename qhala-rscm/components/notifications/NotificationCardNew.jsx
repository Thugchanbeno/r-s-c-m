"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  User,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Archive,
  Trash2,
  MoreVertical,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const NotificationCardNew = ({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete,
}) => {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getPriorityIndicator = (priority) => {
    const config = {
      critical: { icon: AlertCircle, color: "bg-red-500", text: "Critical" },
      high: { icon: AlertTriangle, color: "bg-amber-500", text: "High" },
      medium: { icon: Info, color: "bg-blue-500", text: "Medium" },
      low: { icon: Info, color: "bg-gray-400", text: "Low" },
    };
    return config[priority] || config.medium;
  };

  const priority = getPriorityIndicator(notification.priority || "medium");
  const PriorityIcon = priority.icon;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md group ${
        notification.isRead
          ? "border-gray-100"
          : "border-rscm-violet/30 bg-rscm-lilac/5"
      } ${isSelected ? "ring-2 ring-rscm-violet" : ""}`}
    >
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="flex-shrink-0 pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(notification._id);
              }}
              className="w-4 h-4 text-rscm-violet focus:ring-2 focus:ring-rscm-violet/20 border-gray-300 rounded"
            />
          </div>

          {/* Avatar */}
          <div className="flex-shrink-0">
            {notification.contextData?.actionUserAvatar ? (
              <Image
                src={notification.contextData.actionUserAvatar}
                alt={notification.contextData.actionUserName || "User"}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-rscm-lilac/20 flex items-center justify-center">
                <User className="w-5 h-5 text-rscm-violet" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4
                className={`text-sm font-semibold cursor-pointer hover:text-rscm-violet transition-colors ${
                  notification.isRead ? "text-gray-700" : "text-rscm-dark-purple"
                }`}
                onClick={handleClick}
              >
                {notification.title || "Notification"}
              </h4>
              <div className="flex items-center gap-2">
                {/* Priority Badge */}
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    priority.color
                  } bg-opacity-10`}
                >
                  <PriorityIcon
                    className="w-3 h-3"
                    style={{ color: priority.color.replace("bg-", "#") }}
                  />
                </div>

                {/* Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(!showActions);
                    }}
                    className="p-1 rounded hover:bg-gray-100 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showActions && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowActions(false)}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        {!notification.isRead ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification._id);
                              setShowActions(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Mark as Read
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsUnread(notification._id);
                              setShowActions(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <EyeOff className="w-4 h-4" />
                            Mark as Unread
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchive(notification._id);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification._id);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <p
              className="text-sm text-gray-600 mb-2 cursor-pointer"
              onClick={handleClick}
            >
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{timeAgo}</span>
                {notification.category && (
                  <>
                    <span>•</span>
                    <span className="capitalize">
                      {notification.category.replace("_", " ")}
                    </span>
                  </>
                )}
              </div>

              {notification.requiresAction && notification.actionUrl && (
                <button
                  onClick={() => router.push(notification.actionUrl)}
                  className="px-3 py-1 text-xs font-medium text-white bg-rscm-violet rounded hover:bg-rscm-plum transition-colors"
                >
                  Take Action
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-rscm-violet rounded-r" />
      )}
    </div>
  );
};

export default NotificationCardNew;
