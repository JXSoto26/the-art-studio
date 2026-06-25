import type { BookingStatus } from "../../../lib/admin/types";
import { cn } from "../../../lib/cn";

const bookingStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-olive/15 text-olive",
  paid: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-clay/15 text-clay-deep",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        bookingStyles[status],
      )}
    >
      {status}
    </span>
  );
}

/** Generic active / inactive pill. */
export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        active ? "bg-olive/15 text-olive" : "bg-ink/10 text-ink-soft",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-olive" : "bg-ink-soft",
        )}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-clay/15 px-2.5 py-1 text-xs font-medium text-clay-deep">
      ★ Featured
    </span>
  );
}
