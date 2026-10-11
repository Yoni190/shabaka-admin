import { useState } from "react";
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
          <div className="h-24 w-24 animate-pulse rounded-lg bg-slate-100" />
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
        <div className="space-y-4">
          <BrandImage url={details.brand_image_url} alt={details.name} />

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
        </div>
      )}
    </Modal>
  );
}

function BrandImage({ url, alt }: { url: string | null; alt: string }) {
  const [errored, setErrored] = useState(false);

  if (!url || errored) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
        <div className="text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto h-6 w-6 text-slate-400"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.5-3.5a2 2 0 0 0-2.83 0L6 20" />
          </svg>
          <p className="mt-1.5 text-xs text-slate-500">No image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
      <img
        src={url}
        alt={`${alt} logo`}
        onError={() => setErrored(true)}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}