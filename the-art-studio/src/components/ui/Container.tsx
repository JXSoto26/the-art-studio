import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "main";
};

/** Centered, max-width content wrapper with consistent horizontal padding. */
export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10", className)}>
      {children}
    </Tag>
  );
}
