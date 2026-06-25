import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { navLinks } from "../../lib/content";
import { cn } from "../../lib/cn";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-ink/10 bg-ivory/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-18 items-center justify-between py-4">
        <Link
          to="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-olive text-ivory">
            <span className="font-display text-lg leading-none">A</span>
          </span>
          <span className="font-display text-xl tracking-tight text-ink">
            The Art Studio
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative text-sm font-medium text-ink-soft transition-colors hover:text-ink",
                  "after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-clay after:transition-all after:duration-300",
                  isActive ? "text-ink after:w-full" : "after:w-0 hover:after:w-full",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button to="/classes" variant="primary" size="md">
            Book a class
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-ink/[0.05] md:hidden"
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={cn(
                "absolute left-0 block h-0.5 w-5 bg-ink transition-all duration-300",
                open ? "top-1.5 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1.5 block h-0.5 w-5 bg-ink transition-all duration-300",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 block h-0.5 w-5 bg-ink transition-all duration-300",
                open ? "top-1.5 -rotate-45" : "top-3",
              )}
            />
          </span>
        </button>
      </Container>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-ink/10 bg-ivory/95 backdrop-blur-md transition-[max-height] duration-300 ease-out-soft md:hidden",
          open ? "max-h-96" : "max-h-0 border-t-transparent",
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                  isActive ? "bg-olive/10 text-olive" : "text-ink-soft hover:bg-ink/[0.04]",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="px-1 pt-3">
            <Button
              to="/classes"
              variant="primary"
              size="lg"
              className="w-full"
            >
              Book a class
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
