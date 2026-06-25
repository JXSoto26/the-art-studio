import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../lib/admin/AuthProvider";

/** Gates admin routes; bounces unauthenticated users to the login screen. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
