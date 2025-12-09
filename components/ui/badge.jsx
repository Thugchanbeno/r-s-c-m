import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors ease-in-out duration-200 w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800 border border-gray-200 shadow-sm",
        primary: "bg-[rgb(var(--primary-accent-background))] text-[rgb(var(--primary))] border border-blue-100 shadow-sm",
        secondary: "bg-purple-50 text-purple-700 border border-purple-100 shadow-sm",
        destructive: "bg-red-50 text-red-700 border border-red-100 shadow-sm",
        outline: "bg-transparent text-[rgb(var(--foreground))] border border-[rgb(var(--border))] shadow-sm",
        success: "bg-green-50 text-green-700 border border-green-100 shadow-sm",
        warning: "bg-amber-50 text-amber-700 border border-amber-100 shadow-sm",
        error: "bg-red-50 text-red-700 border border-red-100 shadow-sm",
        gradient: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none shadow-md",
        // Outlined variants
        primary_outline: "bg-transparent text-[rgb(var(--primary))] border border-[rgb(var(--primary))] shadow-sm",
        secondary_outline: "bg-transparent text-purple-700 border border-purple-200 shadow-sm",
        success_outline: "bg-transparent text-green-700 border border-green-200 shadow-sm",
        warning_outline: "bg-transparent text-amber-700 border border-amber-200 shadow-sm",
        destructive_outline: "bg-transparent text-red-700 border border-red-200 shadow-sm",
        default_outline: "bg-transparent text-gray-700 border border-gray-200 shadow-sm",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.75 text-xs",
        lg: "px-3 py-1 text-sm",
        xs: "px-1.5 py-0.25 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  pill = true,
  withDot = false,
  asChild = false,
  children,
  ...props
}) {
  const Comp = asChild ? Slot : "span"
  
  const radiusClasses = pill ? "rounded-full" : "rounded-md";
  
  const dotColorClasses = {
    default: "bg-gray-500",
    primary: "bg-[rgb(var(--primary))]",
    secondary: "bg-purple-500",
    outline: "bg-gray-500",
    success: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    destructive: "bg-red-500",
    gradient: "bg-white",
    primary_outline: "bg-[rgb(var(--primary))]",
    secondary_outline: "bg-purple-500",
    success_outline: "bg-green-500",
    warning_outline: "bg-amber-500",
    destructive_outline: "bg-red-500",
    default_outline: "bg-gray-500",
  };

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size }),
        radiusClasses,
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            "mr-1.5 h-1.5 w-1.5 rounded-full",
            dotColorClasses[variant] || "bg-gray-500"
          )}
        />
      )}
      {children}
    </Comp>
  );
}

export { Badge, badgeVariants }
