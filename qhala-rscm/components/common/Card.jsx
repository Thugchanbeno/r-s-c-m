// components/common/card
"use client";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";

// Main Card Container
export function Card({ children, className, ...props }) {
  return (
    <div
      className={twMerge(
        "rounded-[var(--radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] shadow-sm transition-shadow duration-300 hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Header
export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={twMerge(
        "flex flex-col space-y-1.5 p-6 border-b border-[rgb(var(--border))]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Title
export function CardTitle({
  children,
  className,
  as: Component = "h3",
  ...props
}) {
  return (
    <Component
      className={twMerge(
        "text-xl font-semibold leading-none tracking-tight text-[rgb(var(--card-foreground))]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// Card Description
export function CardDescription({ children, className, ...props }) {
  return (
    <p
      className={twMerge(
        "text-sm text-[rgb(var(--muted-foreground))]",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// Card Content
export function CardContent({ children, className, ...props }) {
  return (
    <div className={twMerge("p-6 pt-4", className)} {...props}>
      {children}
    </div>
  );
}

// Card Footer
export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={twMerge(
        "flex items-center p-6 pt-4 border-t border-[rgb(var(--border))]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// PropTypes (Good practice, kept as is)
Card.propTypes = { children: PropTypes.node, className: PropTypes.string };
CardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
CardTitle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  as: PropTypes.elementType, // Added prop type for 'as'
};
CardDescription.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
CardContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
CardFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
