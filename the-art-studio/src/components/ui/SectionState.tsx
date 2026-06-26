import { cn } from "../../lib/cn";

/**
 * Lightweight loading / empty / error affordances shared by the dynamic
 * public sections. Kept visually quiet so a page in any state still reads as
 * intentional rather than broken.
 */

/** A muted, centered notice used for empty and error states. */
export function SectionMessage({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "error";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink/10 bg-beige/40 px-6 py-10 text-center text-sm",
        tone === "error" ? "text-clay-deep" : "text-ink-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A grid of pulsing card placeholders matching a section's layout. */
export function GridSkeleton({
  count,
  gridClassName,
  cardClassName,
}: {
  count: number;
  gridClassName: string;
  cardClassName?: string;
}) {
  return (
    <div className={gridClassName} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded-2xl bg-ink/[0.06]",
            cardClassName,
          )}
        />
      ))}
    </div>
  );
}
