import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import AdminLoginPage from "./pages/Login/AdminLoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import { useAdminAuth } from "./hooks/useAdminAuth";

function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />

      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="/admin" element={<DashboardPage />} />
        <Route
          path="/admin/products"
          element={<PlaceholderPage title="Products" />}
        />
        <Route
          path="/admin/categories"
          element={<PlaceholderPage title="Categories" />}
        />
        <Route
          path="/admin/brands"
          element={<PlaceholderPage title="Brands" />}
        />
        <Route
          path="/admin/orders"
          element={<PlaceholderPage title="Orders" />}
        />
        <Route
          path="/admin/customers"
          element={<PlaceholderPage title="Business Customers" />}
        />
        <Route
          path="/admin/settings"
          element={<PlaceholderPage title="Settings" />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;