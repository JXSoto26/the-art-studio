import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../lib/admin/AuthProvider";

export function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const initials = (user?.name ?? "A")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink/10 bg-ivory/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={onToggleSidebar}
          className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-ink/[0.05] lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <p className="hidden text-sm text-ink-soft sm:block">
          Welcome back, <span className="font-medium text-ink">{user?.name}</span>
        </p>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-full border border-ink/10 bg-ivory py-1 pl-1 pr-3 transition-colors hover:bg-beige/60"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-olive text-xs font-semibold text-ivory">
            {initials}
          </span>
          <span className="hidden text-sm font-medium text-ink sm:block">
            {user?.email}
          </span>
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-ink/10 bg-ivory shadow-lg">
              <div className="border-b border-ink/10 px-4 py-3">
                <p className="text-sm font-medium text-ink">{user?.name}</p>
                <p className="truncate text-xs text-ink-soft">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                  navigate("/admin/login");
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-clay-deep transition-colors hover:bg-clay/10"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
