"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const DiscoverIconCluster = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const outerSeamlessBg = "bg-slate-900";
  const innerElevatedBg = "bg-slate-900";
  const iconColor = "text-[rgb(var(--accent))]";
  const iconHoverBg = "hover:bg-slate-800";
  const ringOffsetColor = "focus-visible:ring-offset-slate-900";

  // TODO: Replace "/discover" with your actual target page
  const discoverPageHref = "/discover";

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "pt-[2px] pb-[2px] pl-3 pr-[6px]",
        "rounded-l-full",
        outerSeamlessBg
      )}
    >
      <div
        className={cn(
          "flex items-center",
          "p-1",
          "rounded-xl",
          innerElevatedBg,
          "shadow-sm"
        )}
      >
        <Link
          href={discoverPageHref}
          className={cn(
            "inline-flex items-center justify-center",
            "p-1.5 rounded-full transition-colors duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            iconColor,
            iconHoverBg,
            "focus-visible:ring-[rgb(var(--ring))]",
            ringOffsetColor
          )}
          aria-label="Discover content"
        >
          <Lightbulb size={18} />
        </Link>
      </div>
    </div>
  );
};

export default DiscoverIconCluster;
