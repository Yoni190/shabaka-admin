import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminFooter from "./AdminFooter";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AdminNavbar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <AdminFooter />
    </div>
  );
}