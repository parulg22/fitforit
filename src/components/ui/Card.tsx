/**
 * Reusable card component for outfits, closet items, etc.
 */

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ children, hover = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition",
        hover && "hover:border-surface-300 hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
