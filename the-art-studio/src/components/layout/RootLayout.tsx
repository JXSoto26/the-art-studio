import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PublicDataProvider } from "../../lib/public/PublicDataProvider";

/**
 * Shared shell: navbar + routed page + footer.
 * Scrolls to top on every route change so pages always open at the hero.
 *
 * Wrapped in PublicDataProvider so every public page and the shared chrome
 * (navbar/footer) read dynamic content from the same dataService the admin
 * CMS writes to.
 */
export function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <PublicDataProvider>
      <div className="flex min-h-screen flex-col bg-ivory">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </PublicDataProvider>
  );
}
