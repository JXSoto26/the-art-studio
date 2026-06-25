import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";

export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink/10 bg-ivory p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-soft">{label}</p>
        {icon && (
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-olive/10 text-olive">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
