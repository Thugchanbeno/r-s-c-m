"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEnhancedNotifications } from "@/lib/hooks/useEnhancedNotifications";
import { Bell, Info, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

const NotificationRotator = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const { notifications: notificationsData, loading } = useEnhancedNotifications();

  const iconMap = {
    new_request: Bell,
    approval: CheckCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const notifications = (notificationsData || [])
    .filter(n => !n.isRead)
    .slice(0, 5)
    .map((notif) => ({
      icon: iconMap[notif.type] || Info,
      message: notif.message,
      type: notif.type || "info",
    }));

  // Default notification if no unread notifications
  if (notifications.length === 0) {
    notifications.push({
      icon: CheckCircle,
      message: "All caught up! No new notifications",
      type: "success",
    });
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
        setIsTransitioning(false);
      }, 300);
    }, 8000);

    return () => clearInterval(timer);
  }, [notifications.length]);

  const current = notifications[currentIndex];
  const Icon = current.icon;

  return (
    <div className="bg-rscm-lilac/10 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon 
          size={16} 
          className={`flex-shrink-0 text-rscm-violet transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        />
        <span 
          key={currentIndex} 
          className={`text-sm text-rscm-dark-purple truncate transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          {current.message}
        </span>
      </div>
      <button
        onClick={() => router.push("/notifications")}
        className="flex items-center gap-1 text-xs font-medium text-rscm-violet hover:text-rscm-plum transition-colors flex-shrink-0"
      >
        View all
        <ArrowRight size={14} />
      </button>
    </div>
  );
};

export default NotificationRotator;
