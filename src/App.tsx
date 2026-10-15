import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import AdminLoginPage from "./pages/Login/AdminLoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import CategoriesPage from "./pages/Categories/CategoriesPage";
import BrandsPage from "./pages/Brands/BrandsPage";
import ProductsPage from "./pages/Products/ProductsPage";
import CreateProductPage from "./pages/Products/CreateProductPage";
import EditProductPage from "./pages/Products/EditProductPage";
import OrdersPage from "./pages/Orders/OrdersPage";
import OrderDetailsPage from "./pages/Orders/OrderDetailsPage";
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
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="/admin/products/create" element={<CreateProductPage />} />
        <Route path="/admin/products/:id/edit" element={<EditProductPage />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/brands" element={<BrandsPage />} />
        <Route path="/admin/orders" element={<OrdersPage />} />
        <Route path="/admin/orders/:id" element={<OrderDetailsPage />} />
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