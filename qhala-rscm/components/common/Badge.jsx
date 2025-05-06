"use client";
import { twMerge } from "tailwind-merge";

export default function Badge({
  children,
  variant = "default",
  className,
  ...props
}) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    secondary: "bg-purple-100 text-purple-800",
    outline: "bg-transparent border border-gray-200 text-gray-700",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
