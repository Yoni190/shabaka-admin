import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/axios";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import DashboardStatCard, {
  DashboardStatCardSkeleton,
} from "../../components/dashboard/DashboardStatCard";
import type { DashboardData, DashboardResponse } from "../../types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export default function DashboardPage() {
  const { user } = useAdminAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 401s are handled by the auth layer — they will redirect to /login.
      const { data: response } = await api.get<DashboardResponse>(
        "/admin/dashboard",
      );
      setData(response.data);
    } catch {
      setError(
        "We couldn't load the dashboard right now. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
        Dashboard
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        Welcome back{user ? `, ${user.name}` : ""}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        An overview of your catalogue and business customers.
      </p>

      {isLoading && <DashboardSkeleton />}

      {!isLoading && error && (
        <ErrorState message={error} onRetry={fetchDashboard} />
      )}

      {!isLoading && !error && data && <DashboardContent data={data} />}
    </div>
  );
}

/* ---------- Content ---------- */

function DashboardContent({ data }: { data: DashboardData }) {
  const { catalogue, customers, recent_customers } = data;

  return (
    <div className="mt-8 space-y-10">
      {/* Catalogue */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900">Catalogue</h2>
        <p className="mt-1 text-xs text-slate-500">
          Products, categories and brands in your store.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <DashboardStatCard
            label="Total Products"
            value={catalogue.total_products}
          />
          <DashboardStatCard
            label="Active Products"
            value={catalogue.active_products}
            hint={`of ${catalogue.total_products} total`}
          />
          <DashboardStatCard
            label="Inactive Products"
            value={catalogue.inactive_products}
          />
          <DashboardStatCard
            label="Out of Stock"
            value={catalogue.out_of_stock_products}
          />
          <DashboardStatCard
            label="Categories"
            value={catalogue.total_categories}
          />
          <DashboardStatCard
            label="Brands"
            value={catalogue.total_brands}
          />
        </div>
      </section>

      {/* Customers */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900">Customers</h2>
        <p className="mt-1 text-xs text-slate-500">
          Business accounts registered on the platform.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <DashboardStatCard
            label="Business Customers"
            value={customers.total_business_customers}
          />
          <DashboardStatCard
            label="Recently Registered"
            value={customers.recently_registered}
          />
        </div>
      </section>

      {/* Recent customers */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Customers
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Latest business accounts that signed up.
            </p>
          </div>
          <a
            href="/admin/customers"
            className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View all customers →
          </a>
        </div>

        <RecentCustomersTable customers={recent_customers} />
      </section>
    </div>
  );
}

/* ---------- Recent customers table ---------- */

function RecentCustomersTable({
  customers,
}: {
  customers: DashboardData["recent_customers"];
}) {
  if (customers.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-700">
          No recent customers
        </p>
        <p className="mt-1 text-sm text-slate-500">
          New business registrations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-5 py-3">
                Customer
              </th>
              <th scope="col" className="px-5 py-3">
                Business
              </th>
              <th scope="col" className="px-5 py-3">
                Email
              </th>
              <th scope="col" className="px-5 py-3 text-right">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium text-slate-900">
                      {customer.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {customer.business?.name ?? (
                    <span className="italic text-slate-400">
                      No business linked
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {customer.email}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right text-slate-500">
                  {formatDate(customer.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Loading / error states ---------- */

function DashboardSkeleton() {
  return (
    <div className="mt-8 space-y-10">
      <section>
        <div className="h-4 w-24 rounded bg-slate-100" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <DashboardStatCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <section>
        <div className="h-4 w-24 rounded bg-slate-100" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <DashboardStatCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <section>
        <div className="h-4 w-36 rounded bg-slate-100" />
        <div className="mt-4 h-48 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </section>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
      <p className="text-sm font-semibold text-rose-800">
        Something went wrong
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-rose-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
      >
        Try again
      </button>
    </div>
  );
}