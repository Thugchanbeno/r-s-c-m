// components/common/badge
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const defaultProps = {
  variant: "default",
  size: "md",
  pill: true,
  withDot: false,
  className: "",
};

export default function Badge({
  children,
  variant = defaultProps.variant,
  size = defaultProps.size,
  pill = defaultProps.pill,
  withDot = defaultProps.withDot,
  className = defaultProps.className,
  ...props
}) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800 border border-gray-200 shadow-sm",
    primary:
      "bg-[rgb(var(--primary-accent-background))] text-[rgb(var(--primary))] border border-blue-100 shadow-sm",
    secondary:
      "bg-purple-50 text-purple-700 border border-purple-100 shadow-sm",
    outline:
      "bg-transparent text-[rgb(var(--foreground))] border border-[rgb(var(--border))] shadow-sm",
    success: "bg-green-50 text-green-700 border border-green-100 shadow-sm",
    warning: "bg-amber-50 text-amber-700 border border-amber-100 shadow-sm",
    error: "bg-red-50 text-red-700 border border-red-100 shadow-sm",
    gradient:
      "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none shadow-md",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.75 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  const radiusClasses = pill ? "rounded-full" : "rounded-[var(--radius)]";

  const dotColorClasses = {
    default: "bg-gray-500",
    primary: "bg-[rgb(var(--primary))]",
    secondary: "bg-purple-500",
    outline: "bg-gray-500",
    success: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    gradient: "bg-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium transition-colors ease-in-out duration-200",
        radiusClasses,
        sizeClasses[size],
        variantClasses[variant],
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
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "default",
    "primary",
    "secondary",
    "outline",
    "success",
    "warning",
    "error",
    "gradient",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  pill: PropTypes.bool,
  withDot: PropTypes.bool,
  className: PropTypes.string,
};
