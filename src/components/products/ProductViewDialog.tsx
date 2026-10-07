import Modal from "../ui/Modal";
import ProductImageGallery from "./ProductImageGallery";
import type { Product } from "../../types";

interface ProductViewDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  product: Product | null;
  error: string | null;
  onClose: () => void;
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "SAR",
});

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

export default function ProductViewDialog({
  isOpen,
  isLoading,
  product,
  error,
  onClose,
}: ProductViewDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product details"
      maxWidth="max-w-2xl"
    >
      {isLoading && (
        <div className="space-y-3">
          <div className="aspect-[4/3] animate-pulse rounded-lg bg-slate-100" />
          <div className="h-5 animate-pulse rounded bg-slate-100" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && !error && product && (
        <div className="space-y-5">
          <ProductImageGallery
            images={product.images}
            alt={product.name}
          />

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {product.name}
            </h3>
            <p className="mt-0.5 font-mono text-xs text-slate-500">
              {product.sku}
            </p>
          </div>

          {product.description && (
            <p className="text-sm leading-6 text-slate-600">
              {product.description}
            </p>
          )}

          <dl className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-sm">
            <Field label="Brand" value={product.brand.name} />
            <Field label="Category" value={product.category.name} />
            <Field
              label="Price"
              value={priceFormatter.format(Number(product.price))}
            />
            <Field label="Stock" value={String(product.stock_quantity)} />
            <Field
              label="Status"
              value={product.is_active ? "Active" : "Inactive"}
            />
            <Field label="Created" value={formatDate(product.created_at)} />
            <Field
              label="Last updated"
              value={formatDate(product.updated_at)}
            />
          </dl>
        </div>
      )}
    </Modal>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-slate-900">{value}</dd>
    </div>
  );
}