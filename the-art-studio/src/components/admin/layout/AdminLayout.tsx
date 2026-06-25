import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminDataProvider } from "../../../lib/admin/AdminDataProvider";

/**
 * Shell for all authenticated admin pages: sidebar + header + routed content.
 * Wraps children in AdminDataProvider so every admin page shares one data store.
 */
export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <AdminDataProvider>
      <div className="min-h-screen bg-ivory">
        <Sidebar
          open={sidebarOpen}
          onNavigate={() => setSidebarOpen(false)}
        />
        <div className="lg:pl-64">
          <AdminHeader onToggleSidebar={() => setSidebarOpen((v) => !v)} />
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminDataProvider>
  );
}
