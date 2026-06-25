import { useEffect, type ReactNode } from "react";
import { cn } from "../../../lib/cn";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl border border-ink/10 bg-ivory p-6 shadow-xl animate-rise",
          className,
        )}
      >
        {title && (
          <h2 className="font-display text-xl text-ink">{title}</h2>
        )}
        <div className={title ? "mt-3" : undefined}>{children}</div>
      </div>
    </div>
  );
}

/** Confirm dialog built on Modal, used for destructive actions. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm leading-relaxed text-ink-soft">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/[0.04] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-clay px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-clay-deep disabled:opacity-60"
        >
          {busy && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ivory/40 border-t-ivory" />
          )}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
