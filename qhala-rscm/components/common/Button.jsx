"use client";

import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
//specific buttons for use within the app, might need review bc of the warning in the tailwind css file
const baseStyles =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-[rgb(var(--background))]";

const variantStyles = {
  primary:
    "bg-[rgb(var(--button-primary-bg))] text-[rgb(var(--button-primary-text))] hover:bg-[rgb(var(--button-primary-hover-bg))] focus-visible:ring-[rgb(var(--button-primary-bg))]",
  secondary:
    "bg-[rgb(var(--button-secondary-bg,var(--muted-foreground)))] text-[rgb(var(--button-secondary-text,var(--background)))] hover:opacity-80 focus-visible:ring-[rgb(var(--button-secondary-bg,var(--muted-foreground)))]",
  outline:
    "border border-[rgb(var(--border))] bg-transparent hover:bg-[rgba(var(--foreground),0.05)] dark:hover:bg-[rgba(var(--foreground),0.1)]",
  ghost:
    "hover:bg-[rgba(var(--foreground),0.05)] dark:hover:bg-[rgba(var(--foreground),0.1)]",
  danger:
    "bg-[rgb(var(--button-danger-bg,176,36,46))] text-[rgb(var(--button-danger-text,255,255,255))] hover:opacity-80 focus-visible:ring-[rgb(var(--button-danger-bg,176,36,46))]",
  success:
    "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
};

const sizeStyles = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 py-2 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
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
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
