import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listOrders } from "../../api/admin/orders";
import { getErrorMessage } from "../../lib/axios";
import { useDebounce } from "../../hooks/useDebounce";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "../../components/orders/OrderStatusBadge";
import type {
  AdminOrderListItem,
  AdminOrderPaginationMeta,
  OrderStatus,
} from "../../types/order";

const statusOptions: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function formatMoney(amount: string, currency: string): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "SAR",
    }).format(value);
  } catch {
    // Unknown currency code — fall back to plain number with code suffix.
    return `${value.toFixed(2)} ${currency}`;
  }
}

export default function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [meta, setMeta] = useState<AdminOrderPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listOrders({
        page,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter || undefined,
      });

      if (response.data.length === 0 && response.meta.current_page > 1) {
        setPage(response.meta.current_page - 1);
        return;
      }

      setOrders(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load orders."));
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  // Reset to page 1 whenever search or filter changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const clearFilters = () => {
    setSearchInput("");
    setStatusFilter("");
    setPage(1);
  };

  const hasFilters =
    debouncedSearch.trim().length > 0 || statusFilter !== "";
  const isEmpty = !isLoading && !error && orders.length === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Sales
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Orders
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          View and manage customer orders placed through your storefront.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <label htmlFor="order-search" className="sr-only">
            Search orders
          </label>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="order-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by order number…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label htmlFor="order-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="order-status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as OrderStatus | "")
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-slate-600 transition hover:text-slate-900"
          >
            Clear filters
          </button>
        )}

        {meta && !isLoading && (
          <p className="ml-auto text-xs text-slate-500">
            {meta.total} {meta.total === 1 ? "order" : "orders"}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="mt-4">
        {isLoading && <TableSkeleton />}

        {!isLoading && error && (
          <ErrorState message={error} onRetry={fetchList} />
        )}

        {!isLoading && !error && isEmpty && (
          <EmptyState hasFilters={hasFilters} />
        )}

        {!isLoading && !error && orders.length > 0 && (
          <>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th scope="col" className="px-5 py-3">Order</th>
                      <th scope="col" className="px-5 py-3">Customer</th>
                      <th scope="col" className="px-5 py-3">Date</th>
                      <th scope="col" className="px-5 py-3">Total</th>
                      <th scope="col" className="px-5 py-3">Status</th>
                      <th scope="col" className="px-5 py-3">Payment</th>
                      <th scope="col" className="px-5 py-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/60"
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-medium text-slate-900">
                          {order.order_number}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-slate-900">
                            {order.business_name ?? "—"}
                          </p>
                          {order.user_name && (
                            <p className="text-xs text-slate-500">
                              {order.user_name}
                              {order.user_email && ` · ${order.user_email}`}
                            </p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-900">
                          {formatMoney(order.total_amount, order.currency)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <PaymentStatusBadge
                            status={order.payment_status}
                          />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/orders/${order.id}`)
                            }
                            className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {meta && meta.last_page > 1 && (
              <Pagination meta={meta} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Inline sub-components ---------- */

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
        <div className="h-3 w-40 rounded bg-slate-200" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-4 px-5 py-4"
          >
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="h-4 w-40 rounded bg-slate-100" />
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="ml-auto h-4 w-24 rounded bg-slate-100" />
          </div>
        ))}
      </div>
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
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
      <p className="text-sm font-semibold text-rose-800">
        Couldn't load orders
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

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-semibold text-slate-900">
        {hasFilters ? "No orders match your filters" : "No orders yet"}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {hasFilters
          ? "Try changing your search or status filter."
          : "Orders placed by your customers will appear here."}
      </p>
    </div>
  );
}

function Pagination({
  meta,
  onPageChange,
}: {
  meta: AdminOrderPaginationMeta;
  onPageChange: (page: number) => void;
}) {
  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.last_page;

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-slate-500">
        Showing {meta.from ?? 0}–{meta.to ?? 0} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(meta.current_page - 1)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-xs text-slate-600">
          Page {meta.current_page} of {meta.last_page}
        </span>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(meta.current_page + 1)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}