import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";

/**
 * Lightweight table primitives. Wrap in a Card for a framed look; the wrapper
 * handles horizontal scroll on small screens.
 */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-beige/50 text-ink-soft">{children}</thead>;
}

export function TH({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-ink/10">{children}</tbody>;
}

export function TR({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-beige/30", className)}>
      {children}
    </tr>
  );
}

export function TD({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-5 py-4 align-middle", className)}>{children}</td>;
}
