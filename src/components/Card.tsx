"use client";

import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "police" | "thief" | "glass";
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
      default: "bg-gray-900/80 border border-gray-800",
      police: "bg-police-900/30 border border-police-700/50",
      thief: "bg-thief-900/30 border border-thief-700/50",
      glass: "bg-white/5 backdrop-blur-xl border border-white/10",
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-5",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={`
          rounded-2xl
          ${variants[variant]}
          ${paddings[padding]}
          ${hover ? "hover:border-gray-600 hover:bg-gray-800/80 transition-all duration-200 cursor-pointer" : ""}
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
