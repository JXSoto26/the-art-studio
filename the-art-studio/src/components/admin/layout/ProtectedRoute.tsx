import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../lib/admin/AuthProvider";

/** Gates admin routes; bounces unauthenticated users to the login screen. */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait for an existing session to be restored before deciding (Supabase mode),
  // so a logged-in admin isn't briefly bounced to the login screen on refresh.
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-beige/50">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-olive/30 border-t-olive" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
