import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

/** Small pill used for class levels and tags. */
export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-olive/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-olive",
        className,
      )}
    >
      {children}
    </span>
  );
}
