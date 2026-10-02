import Modal from "../ui/Modal";
import type { BrandDetails } from "../../types";

interface BrandViewDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  details: BrandDetails | null;
  error: string | null;
  onClose: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export default function BrandViewDialog({
  isOpen,
  isLoading,
  details,
  error,
  onClose,
}: BrandViewDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Brand details">
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-5 animate-pulse rounded bg-slate-100"
            />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && !error && details && (
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Name
            </dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              {details.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Products
            </dt>
            <dd className="mt-0.5 text-slate-900">
              {details.products_count}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Created
            </dt>
            <dd className="mt-0.5 text-slate-900">
              {formatDate(details.created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Last updated
            </dt>
            <dd className="mt-0.5 text-slate-900">
              {formatDate(details.updated_at)}
            </dd>
          </div>
        </dl>
      )}
    </Modal>
  );
}