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
  as: Component = "button",
  ...props
}) {
  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <Component
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
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
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
        className={clsx("inline-flex items-center justify-center", {
          "ml-2": isLoading && children,
          "opacity-0": isLoading && !children,
        })}
      >
        {!isLoading && leftIcon && (
          <span className={children ? "mr-2" : ""}>{leftIcon}</span>
        )}
        {(!isLoading || (isLoading && children)) && children}
        {!isLoading && rightIcon && (
          <span className={children ? "ml-2" : ""}>{rightIcon}</span>
        )}
      </span>
    </Component>
  );
}
