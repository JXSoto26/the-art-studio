import { Link, NavLink } from "react-router-dom";
import { adminNavItems } from "./navItems";
import { cn } from "../../../lib/cn";

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onNavigate}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink/10 bg-beige/60 transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-ink/10 px-5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-olive text-ivory">
            <span className="font-display text-lg leading-none">A</span>
          </span>
          <div className="leading-tight">
            <p className="font-display text-base text-ink">The Art Studio</p>
            <p className="text-xs text-ink-soft">Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={!item.matchPrefix}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-olive text-ivory shadow-sm"
                    : "text-ink-soft hover:bg-ink/[0.05] hover:text-ink",
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer link back to site */}
        <div className="border-t border-ink/10 p-3">
          <Link
            to="/"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
            <span aria-hidden>←</span>
            View live site
          </Link>
        </div>
      </aside>
    </>
  );
}
