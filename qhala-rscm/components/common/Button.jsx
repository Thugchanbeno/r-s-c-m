// components/common/button
"use client";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

const baseStyles =
  "inline-flex items-center justify-center rounded-[var(--radius)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-[rgb(var(--background))] focus-visible:ring-[rgb(var(--ring))]";

const variantStyles = {
  primary:
    "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:bg-blue-700",

  secondary:
    "bg-[rgb(var(--secondary))] text-[rgb(var(--secondary-foreground))] hover:opacity-80",
  outline:
    "border border-[rgb(var(--border))] bg-transparent text-[rgb(var(--primary))] hover:bg-[rgba(var(--primary),0.1)]",

  ghost:
    "text-[rgb(var(--primary))] hover:bg-[rgba(var(--primary),0.1)] dark:text-[rgb(var(--primary))] dark:hover:bg-[rgba(var(--primary),0.2)]",

  subtle:
    "text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-accent-background))] dark:text-blue-400 dark:hover:bg-blue-900",
  danger:
    "bg-[rgb(var(--destructive))] text-[rgb(var(--destructive-foreground))] hover:opacity-80",
  success:
    "bg-[rgb(var(--success))] text-[rgb(var(--success-foreground))] hover:bg-green-700",
};

const sizeStyles = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 py-2 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
  xs: "h-auto px-3 py-1 text-xs",
};

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}) {
  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variantStyles[variant] || variantStyles.primary,
          sizeStyles[size] || sizeStyles.md,
          widthStyle,
          className
        )
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {/* SVG Loader remains the same */}
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          // ... (rest of SVG)
        >
          <circle /* ... */ />
          <path /* ... */ />
        </svg>
      )}
      <span className={clsx("inline-flex items-center", { "ml-2": isLoading })}>
        {!isLoading && leftIcon && (
          <span className={children ? "mr-2" : ""}>{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className={children ? "ml-2" : ""}>{rightIcon}</span>
        )}
      </span>
    </button>
  );
}
