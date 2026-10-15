import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getOrder, updateOrderStatus } from "../../api/admin/orders";
import { getErrorMessage, isNotFound, isValidationError } from "../../lib/axios";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "../../components/orders/OrderStatusBadge";
import OrderStatusUpdater from "../../components/orders/OrderStatusUpdater";
import type { AdminOrderDetail, OrderStatus } from "../../types/order";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
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
    return `${value.toFixed(2)} ${currency}`;
  }
}

type Status =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "not_found" }
  | { kind: "loaded"; order: AdminOrderDetail };

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(orderId) || orderId <= 0) {
      setStatus({ kind: "not_found" });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      const order = await getOrder(orderId);
      setStatus({ kind: "loaded", order });
    } catch (err) {
      if (isNotFound(err)) {
        setStatus({ kind: "not_found" });
      } else {
        setStatus({
          kind: "error",
          message: getErrorMessage(err, "Failed to load this order."),
        });
      }
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Auto-dismiss success banner.
  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleStatusUpdate = async (next: OrderStatus) => {
    if (status.kind !== "loaded") return;
    const currentOrder = status.order;

    setIsUpdating(true);
    setUpdateError(null);
    try {
      const updated = await updateOrderStatus(currentOrder.id, next);
      setStatus({ kind: "loaded", order: updated });
      setSuccessMessage(`Order marked as ${next}.`);
    } catch (err) {
      if (isValidationError(err)) {
        setUpdateError(
          err.response.data.errors.status?.[0] ??
            err.response.data.message ??
            "That status change isn't allowed.",
        );
      } else {
        setUpdateError(
          getErrorMessage(
            err,
            "Failed to update order status. Please try again.",
          ),
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  /* ---------- Non-loaded states ---------- */

  if (status.kind === "loading") {
    return <DetailsSkeleton />;
  }

  if (status.kind === "not_found") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Error 404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Order not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          This order doesn't exist or has been removed.
        </p>
        <button
          type="button"
          onClick={() => navigate("/admin/orders")}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Back to orders
        </button>
      </div>
    );
  }

  if (status.kind === "error") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="text-sm font-semibold text-rose-800">
            Couldn't load order
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-rose-700">
            {status.message}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Try again
            </button>
            <Link
              to="/admin/orders"
              className="inline-flex items-center justify-center rounded-lg border border-rose-300 bg-white px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              Back to orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Loaded ---------- */

  const { order } = status;
  const items = order.items ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to orders
          </button>

          <h1 className="mt-3 break-words font-mono text-2xl font-bold tracking-tight text-slate-900">
            {order.order_number}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Placed on {formatDate(order.created_at)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
        </div>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {successMessage}
        </div>
      )}

      {updateError && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {updateError}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          {/* Items */}
          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-slate-900">
                Items ({items.length})
              </h2>
            </div>

            {items.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">
                No items recorded on this order.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {item.product_name}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-slate-500">
                        {item.sku}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.quantity} ×{" "}
                        {formatMoney(item.unit_price, order.currency)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatMoney(item.subtotal, order.currency)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Addresses */}
          <div className="grid gap-6 sm:grid-cols-2">
            <AddressCard
              title="Shipping address"
              address={order.shipping_address}
            />
            <AddressCard
              title="Billing address"
              address={order.billing_address}
            />
          </div>

          {/* Notes */}
          {order.notes && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Order notes
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {order.notes}
              </p>
            </section>
          )}
        </div>

        {/* Side column */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Summary */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900">
              Summary
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row
                label="Subtotal"
                value={formatMoney(order.subtotal, order.currency)}
              />
              <Row
                label="Tax"
                value={formatMoney(order.tax_amount, order.currency)}
              />
              <Row
                label="Shipping"
                value={formatMoney(order.shipping_amount, order.currency)}
              />
              <Row
                label="Discount"
                value={formatMoney(order.discount_amount, order.currency)}
              />
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <dt className="text-base font-semibold text-slate-900">
                  Total
                </dt>
                <dd className="text-base font-bold text-slate-900">
                  {formatMoney(order.total_amount, order.currency)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Customer / business */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900">
              Customer
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Business
                </dt>
                <dd className="mt-0.5 text-slate-900">
                  {order.business?.name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Contact
                </dt>
                <dd className="mt-0.5 text-slate-900">
                  {order.user?.name ?? "—"}
                </dd>
                {order.user?.email && (
                  <dd className="mt-0.5 break-all text-xs text-slate-500">
                    {order.user.email}
                  </dd>
                )}
              </div>
            </dl>
          </section>

          {/* Status updater */}
          <OrderStatusUpdater
            currentStatus={order.status}
            isUpdating={isUpdating}
            onUpdate={handleStatusUpdate}
          />
        </aside>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-600">{label}</dt>
      <dd className="text-slate-900">{value}</dd>
    </div>
  );
}

function AddressCard({
  title,
  address,
}: {
  title: string;
  address: AdminOrderDetail["shipping_address"];
}) {
  if (!address) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">Not provided.</p>
      </section>
    );
  }

  const lines = [
    address.address_line_1,
    address.address_line_2,
    [address.city, address.state_or_region, address.postal_code]
      .filter(Boolean)
      .join(", "),
    address.country_code,
  ].filter((line): line is string => Boolean(line && line.trim()));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <address className="mt-3 not-italic text-sm leading-6 text-slate-600">
        <span className="block font-medium text-slate-900">
          {address.recipient_name}
        </span>
        {address.company_name && (
          <span className="block">{address.company_name}</span>
        )}
        {lines.map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
        {address.phone && (
          <span className="mt-1 block text-slate-500">{address.phone}</span>
        )}
      </address>
    </section>
  );
}

function DetailsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
      <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
      <div className="mt-4 h-8 w-64 animate-pulse rounded bg-slate-100" />
      <div className="mt-3 h-4 w-48 animate-pulse rounded bg-slate-100" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}