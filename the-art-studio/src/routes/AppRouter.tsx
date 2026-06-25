import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "../components/layout/RootLayout";
import { HomePage } from "../pages/HomePage";
import { ClassesPage } from "../pages/ClassesPage";
import { GalleryPage } from "../pages/GalleryPage";
import { AboutPage } from "../pages/AboutPage";
import { ContactPage } from "../pages/ContactPage";
import { NotFoundPage } from "../pages/NotFoundPage";

import { AuthProvider } from "../lib/admin/AuthProvider";
import { ProtectedRoute } from "../components/admin/layout/ProtectedRoute";
import { AdminLayout } from "../components/admin/layout/AdminLayout";
import { LoginPage } from "../pages/admin/LoginPage";
import { DashboardPage } from "../pages/admin/DashboardPage";
import { WorkshopsPage } from "../pages/admin/WorkshopsPage";
import { WorkshopFormPage } from "../pages/admin/WorkshopFormPage";
import { GalleryPage as AdminGalleryPage } from "../pages/admin/GalleryPage";
import { BookingsPage } from "../pages/admin/BookingsPage";
import { SettingsPage } from "../pages/admin/SettingsPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public site */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="workshops" element={<WorkshopsPage />} />
              <Route path="workshops/new" element={<WorkshopFormPage />} />
              <Route path="workshops/:id/edit" element={<WorkshopFormPage />} />
              <Route path="gallery" element={<AdminGalleryPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
