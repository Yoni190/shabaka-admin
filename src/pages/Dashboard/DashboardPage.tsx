import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function DashboardPage() {
  const { user } = useAdminAuth();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
        Dashboard
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        Welcome back{user ? `, ${user.name}` : ""}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Admin tooling will live here — catalogue, orders, and customer
        management.
      </p>
    </div>
  );
}