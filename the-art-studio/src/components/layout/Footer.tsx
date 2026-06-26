import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { navLinks } from "../../lib/content";
import { usePublicData } from "../../lib/public/PublicDataProvider";

export function Footer() {
  const year = 2026;
  const { settings } = usePublicData();
  const addressLines =
    settings?.address.split(",").map((l) => l.trim()) ?? [];
  const social = [
    {
      label: "Instagram",
      href: settings?.instagram_url || "https://instagram.com",
    },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "Journal", href: "#" },
  ];

  return (
    <footer className="mt-24 border-t border-ink/10 bg-beige">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + newsletter */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-olive text-ivory">
                <span className="font-display text-lg leading-none">A</span>
              </span>
              <span className="font-display text-xl text-ink">The Art Studio</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
              A warm, light-filled space for painting, ceramics, and the quiet joy
              of making something by hand.
            </p>

            <form
              className="mt-6 flex max-w-sm items-center gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Your email"
                aria-label="Email address"
                className="w-full rounded-full border border-ink/15 bg-ivory px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 focus:border-olive focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-olive px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-olive-deep"
              >
                Join
              </button>
            </form>
          </div>

          {/* Explore */}
          <nav aria-label="Footer">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Visit / social */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">
              Visit
            </h3>
            <address className="mt-4 space-y-1 text-sm not-italic leading-relaxed text-ink-soft">
              {addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {settings?.business_hours && <p>{settings.business_hours}</p>}
            </address>
            <ul className="mt-5 flex gap-4">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="text-sm font-medium text-ink-soft transition-colors hover:text-clay"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-6 text-xs text-ink-soft sm:flex-row">
          <p>© {year} The Art Studio. Made with warm hands and warmer light.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-ink">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-ink">
              Terms
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
