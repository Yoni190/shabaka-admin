import type { OrderStatus, PaymentStatus } from "../../types/order";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-800",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-indigo-50 text-indigo-700",
  shipped: "bg-cyan-50 text-cyan-800",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const paymentStyles: Record<PaymentStatus, string> = {
  unpaid: "bg-slate-100 text-slate-700",
  paid: "bg-emerald-50 text-emerald-700",
  refunded: "bg-slate-100 text-slate-700",
  partially_refunded: "bg-amber-50 text-amber-800",
};

const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${paymentStyles[status]}`}
    >
      {paymentLabels[status]}
    </span>
  );
}