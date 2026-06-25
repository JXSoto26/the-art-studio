import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";

/** Centered spinner for in-flight loads. */
export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-ink-soft",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-ink/15 border-t-olive" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

/** Row of shimmering placeholder bars, used while tables load. */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-ink/10" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-4 w-1/3 animate-pulse rounded bg-ink/10" />
          <div className="h-4 w-1/5 animate-pulse rounded bg-ink/10" />
          <div className="ml-auto h-4 w-16 animate-pulse rounded bg-ink/10" />
        </div>
      ))}
    </div>
  );
}

/** Error block with a retry affordance. */
export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-clay/30 bg-clay/10 px-6 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-clay/20 text-clay-deep">
        !
      </span>
      <p className="max-w-sm text-sm text-ink-soft">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-full border border-clay/40 px-4 py-1.5 text-sm font-medium text-clay-deep transition-colors hover:bg-clay/10"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/** Friendly empty placeholder with an optional primary action. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-beige/30 px-6 py-16 text-center",
        className,
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-olive/10 text-2xl text-olive">
        {icon ?? "✦"}
      </span>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
