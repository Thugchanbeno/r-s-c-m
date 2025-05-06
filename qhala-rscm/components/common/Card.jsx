"use client";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";

export function Card({ children, className }) {
  return (
    <div
      className={twMerge(
        "bg-[rgb(var(--card-background))] text-[rgb(var(--card-foreground))]",
        "rounded-lg border border-[rgb(var(--border))] shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
export function CardHeader({ children, className }) {
  return (
    <div
      className={twMerge(
        "flex flex-col space-y-1.5 p-6 border-b border-[rgb(var(--border))]",
        className
      )}
    >
      {children}
    </div>
  );
}
export function CardTitle({ children, className }) {
  return (
    <h3
      className={twMerge(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
    >
      {children}
    </h3>
  );
}
export function CardDescription({ children, className }) {
  return (
    <p
      className={twMerge(
        "text-sm text-[rgb(var(--muted-foreground))]",
        className
      )}
    >
      {children}
    </p>
  );
}
export function CardContent({ children, className }) {
  return <div className={twMerge("p-6", className)}>{children}</div>;
}
export function CardFooter({ children, className }) {
  return (
    <div
      className={twMerge(
        "flex items-center p-6 border-t border-[rgb(var(--border))]",
        className
      )}
    >
      {children}
    </div>
  );
}

Card.propTypes = { children: PropTypes.node, className: PropTypes.string };
CardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
CardTitle.propTypes = { children: PropTypes.node, className: PropTypes.string };
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
