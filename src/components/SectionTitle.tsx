"use client";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return (
    <h2 className={`text-base font-semibold text-gray-900 mb-3 mt-6 first:mt-0 ${className}`}>
      {children}
    </h2>
  );
}
