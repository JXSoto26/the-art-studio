import type { ReactNode, SelectHTMLAttributes } from "react";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "../../../lib/cn";

const controlBase =
  "w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20 disabled:opacity-60";

/** Label + control + optional hint/error wrapper. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-ink"
      >
        {label}
        {required && <span className="ml-0.5 text-clay">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-clay-deep">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(controlBase, "resize-none", className)} {...props} />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlBase, "appearance-none", className)} {...props}>
      {children}
    </select>
  );
}

/** Accessible toggle switch bound to a boolean. */
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-ink/15 bg-ivory px-3.5 py-3">
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-ink-soft">
            {description}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-olive" : "bg-ink/20",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </label>
  );
}
