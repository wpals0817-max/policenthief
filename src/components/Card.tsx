"use client";

import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "police" | "thief" | "section";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = "default",
      padding = "md",
      hover = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "bg-white border border-gray-200 shadow-sm",
      police: "bg-blue-50 border border-blue-200",
      thief: "bg-red-50 border border-red-200",
      section: "bg-white border border-gray-200",
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={`
          rounded-xl
          ${variants[variant]}
          ${paddings[padding]}
          ${hover ? "hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
