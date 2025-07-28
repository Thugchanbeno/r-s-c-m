"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm",
        "ring-offset-[rgb(var(--background))]",
        "placeholder:text-[rgb(var(--muted-foreground))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
