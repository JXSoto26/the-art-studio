import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 ease-out-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-olive text-ivory shadow-sm hover:bg-olive-deep hover:shadow-md hover:-translate-y-0.5",
  secondary:
    "bg-clay text-ivory shadow-sm hover:bg-clay-deep hover:shadow-md hover:-translate-y-0.5",
  ghost:
    "border border-ink/15 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/[0.03]",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsLink = CommonProps & { to: string; href?: never };
type ButtonAsAnchor = CommonProps & { href: string; to?: never };
type ButtonAsButton = CommonProps & {
  to?: never;
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

type ButtonProps = ButtonAsLink | ButtonAsAnchor | ButtonAsButton;

export function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", className } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("to" in props && props.to) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    );
  }

  if ("href" in props && props.href) {
    return (
      <a href={props.href} className={classes}>
        {children}
      </a>
    );
  }

  const { onClick, type = "button", disabled } = props as ButtonAsButton;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
