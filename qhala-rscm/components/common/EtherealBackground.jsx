"use client";

import React from "react";
import { EtherealShadow } from "@/components/common/EtherealShadow";
import { useTheme } from "next-themes";

const EtherealBackground = ({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <EtherealShadow
        color={isDark ? "rgba(20, 20, 20, 1)" : "rgba(128, 128, 128, 1)"}
        animation={{ scale: 80, speed: 60 }}
        noise={{ opacity: isDark ? 0.3 : 0.6, scale: 1.2 }}
        sizing="fill"
        className="absolute inset-0 -z-10"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default EtherealBackground;
