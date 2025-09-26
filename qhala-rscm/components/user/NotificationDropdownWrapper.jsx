"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import EnhancedNotificationDropdown from "./EnhancedNotificationDropdown";

const NotificationDropdownWrapper = ({
  isOpen,
  onClose,
  onMarkAllReadSuccess,
  onNotificationRead,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "absolute top-full right-0 mt-2 z-50",
          "w-[440px] max-w-[90vw] max-h-[70vh]",
          "shadow-xl border rounded-lg overflow-hidden",
          "bg-[rgb(var(--card))] border-[rgb(var(--border))]"
        )}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <EnhancedNotificationDropdown 
          className="border-0 shadow-none p-4 max-w-none w-full"
          onClose={onClose}
          onMarkAllReadSuccess={onMarkAllReadSuccess}
          onNotificationRead={onNotificationRead}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationDropdownWrapper;