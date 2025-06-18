"use client";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

const baseStyles =
  "inline-flex items-center justify-center rounded-[var(--radius)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-[rgb(var(--background))] focus-visible:ring-[rgb(var(--ring))]";

const variantStyles = {
  primary:
    "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:opacity-90 focus-visible:ring-[rgb(var(--primary))]",
  secondary:
    "bg-[rgb(var(--secondary))] text-[rgb(var(--secondary-foreground))] hover:opacity-90",
  outline:
    "border border-[rgb(var(--border))] bg-transparent text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]",
  ghost:
    "text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] dark:hover:bg-[rgb(var(--muted))]",
  success:
    "bg-[rgb(var(--success))] text-[rgb(var(--success-foreground))] hover:opacity-90",
  warning:
    "bg-[rgb(var(--warning))] text-[rgb(var(--warning-foreground))] hover:opacity-90",
  danger:
    "bg-[rgb(var(--destructive))] text-[rgb(var(--destructive-foreground))] hover:opacity-90",
  destructive:
    "bg-[rgb(var(--destructive))] text-[rgb(var(--destructive-foreground))] hover:opacity-90 focus-visible:ring-[rgb(var(--destructive))]",

  primary_outline:
    "border border-[rgb(var(--primary))] bg-transparent text-[rgb(var(--primary))] hover:bg-[rgba(var(--primary),0.1)]",
  secondary_outline:
    "border border-[rgb(var(--secondary))] bg-transparent text-[rgb(var(--secondary))] hover:bg-[rgba(var(--secondary),0.1)]",
  success_outline:
    "border border-[rgb(var(--success))] bg-transparent text-[rgb(var(--success))] hover:bg-[rgba(var(--success),0.1)]",
  warning_outline:
    "border border-[rgb(var(--warning))] bg-transparent text-[rgb(var(--warning))] hover:bg-[rgba(var(--warning),0.1)]",
  destructive_outline:
    "border border-[rgb(var(--destructive))] bg-transparent text-[rgb(var(--destructive))] hover:bg-[rgba(var(--destructive),0.1)]",
  subtle:
    "text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-accent-background))] dark:text-blue-400 dark:hover:bg-blue-900",
};

const sizeStyles = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 py-2 text-sm",
  lg: "h-12 px-6 text-base",
  xs: "h-8 px-2.5 text-xs",
  "icon-sm": "h-8 w-8 p-0",
  icon: "h-10 w-10 p-0",
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
  as: Component = "button",
  ...props
}) {
  const widthStyle = fullWidth ? "w-full" : "";

  const spinnerColorClass =
    variant === "primary" ||
    variant === "destructive" ||
    variant === "success" ||
    variant === "warning" ||
    variant === "secondary"
      ? "text-current"
      : "text-[rgb(var(--primary))]";

  return (
    <Component
      className={twMerge(
        clsx(
          baseStyles,
          variantStyles[variant] || variantStyles.primary,
          sizeStyles[size] || sizeStyles.md,
          widthStyle,
          isLoading ? "cursor-wait" : "",
          className
        )
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className={clsx("animate-spin h-4 w-4", spinnerColorClass)}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      <span
        className={clsx(
          "inline-flex items-center justify-center leading-none",
          {
            "ml-2": isLoading && children,
            // "opacity-0": isLoading && !children, // This would hide icon-only buttons when loading, might not be desired
          }
        )}
      >
        {!isLoading && leftIcon && (
          <span className={children ? "mr-1.5" : ""}>{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className={children ? "ml-1.5" : ""}>{rightIcon}</span>
        )}
      </span>
    </Component>
  );
}
