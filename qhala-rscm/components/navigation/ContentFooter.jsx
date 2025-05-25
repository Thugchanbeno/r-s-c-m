"use client";
import { cn } from "@/lib/utils";

const ContentFooter = ({ isAdminArea = false }) => {
  const stripBg = isAdminArea ? "bg-slate-900" : "bg-background";
  const gradientFrom = isAdminArea ? "from-slate-900" : "from-background";
  const gradientVia = isAdminArea ? "via-slate-900/70" : "via-background/70";
  const gradientTo = "to-transparent";

  return (
    <div
      className={cn(
        "relative w-full flex items-center shrink-0",
        "h-2 md:h-3",
        stripBg
      )}
      aria-hidden="true"
    >
      {isAdminArea && (
        <>
          <div
            className={cn(
              "absolute left-0 bottom-0 h-full w-12 pointer-events-none",
              `bg-gradient-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`
            )}
          />
          <div
            className={cn(
              "absolute right-0 bottom-0 h-full w-12 pointer-events-none",
              `bg-gradient-to-l ${gradientFrom} ${gradientVia} ${gradientTo}`
            )}
          />
        </>
      )}
      <div className="flex-1 h-full" />
    </div>
  );
};

export default ContentFooter;
