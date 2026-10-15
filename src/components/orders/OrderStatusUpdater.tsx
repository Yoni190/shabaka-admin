import { useState } from "react";
import Modal from "../ui/Modal";
import type { OrderStatus } from "../../types/order";

interface OrderStatusUpdaterProps {
  currentStatus: OrderStatus;
  isUpdating: boolean;
  onUpdate: (next: OrderStatus) => Promise<void>;
}

/**
 * Only reachable from the current status. Terminal statuses map to [].
 * The backend enforces the real rules — this just constrains the UI.
 */
const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderStatusUpdater({
  currentStatus,
  isUpdating,
  onUpdate,
}: OrderStatusUpdaterProps) {
  const [pendingSelection, setPendingSelection] = useState<OrderStatus | null>(
    null,
  );
  const [confirmCancel, setConfirmCancel] = useState(false);

  const options = nextStatuses[currentStatus];

  if (options.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">
          Update status
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          This order is {statusLabels[currentStatus].toLowerCase()}. No further
          status changes are available.
        </p>
      </div>
    );
  }

  const handleSelect = (next: OrderStatus) => {
    if (next === "cancelled") {
      setConfirmCancel(true);
      return;
    }
    setPendingSelection(next);
  };

  const confirm = async () => {
    if (!pendingSelection) return;
    const target = pendingSelection;
    setPendingSelection(null);
    await onUpdate(target);
  };

  const confirmCancellation = async () => {
    setConfirmCancel(false);
    await onUpdate("cancelled");
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">
          Update status
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Move this order to the next stage. Changes are saved on the backend.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {options.map((option) => {
            const isCancel = option === "cancelled";
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                disabled={isUpdating}
                className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isCancel
                    ? "border border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isUpdating && pendingSelection === option ? "Updating…" : `Mark as ${statusLabels[option]}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm non-cancellation transition */}
      <Modal
        isOpen={pendingSelection !== null}
        onClose={() => setPendingSelection(null)}
        title="Confirm status change"
      >
        <p className="text-sm text-slate-700">
          Change this order from{" "}
          <span className="font-semibold">
            {statusLabels[currentStatus]}
          </span>{" "}
          to{" "}
          <span className="font-semibold">
            {pendingSelection ? statusLabels[pendingSelection] : ""}
          </span>
          ?
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setPendingSelection(null)}
            disabled={isUpdating}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={isUpdating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isUpdating ? "Updating…" : "Confirm"}
          </button>
        </div>
      </Modal>

      {/* Confirm cancellation */}
      <Modal
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel order"
      >
        <p className="text-sm text-slate-700">
          Are you sure you want to cancel this order?
        </p>
        <p className="mt-2 text-sm text-slate-500">
          This cannot be undone. Stock and payment status are going to be modified by
          this action.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmCancel(false)}
            disabled={isUpdating}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep order
          </button>
          <button
            type="button"
            onClick={confirmCancellation}
            disabled={isUpdating}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isUpdating ? "Cancelling…" : "Cancel order"}
          </button>
        </div>
      </Modal>
    </>
  );
}