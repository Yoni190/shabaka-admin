import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminMobileHeader from "./AdminMobileHeader";
import AdminFooter from "./AdminFooter";

/**
 * Admin shell: fixed sidebar on desktop, drawer on mobile, main content
 * rendered via <Outlet />. Sidebar visibility is local state, no global
 * store needed for a single boolean.
 */
export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminMobileHeader onMenuClick={openSidebar} />

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <AdminSidebar isOpen={isSidebarOpen} onNavigate={closeSidebar} />

      {/* Content shifted right of the fixed 16rem sidebar on desktop */}
      <div className="lg:pl-64">
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:min-h-screen">
          <main className="flex-1">
            <Outlet />
          </main>
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}