import type { Product, ProductSortField, SortDirection } from "../../types";

interface ProductTableProps {
  products: Product[];
  sortField: ProductSortField;
  sortDirection: SortDirection;
  onSort: (field: ProductSortField) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "SAR",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function pickThumbnail(product: Product): string | null {
  const primary = product.images.find((image) => image.is_primary);
  return (primary ?? product.images[0])?.url ?? null;
}

export default function ProductTable({
  products,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th scope="col" className="w-16 px-5 py-3">
                Image
              </th>
              <SortHeader
                label="Product"
                field="name"
                active={sortField}
                direction={sortDirection}
                onSort={onSort}
              />
              <th scope="col" className="px-5 py-3">
                SKU
              </th>
              <th scope="col" className="px-5 py-3">
                Brand
              </th>
              <th scope="col" className="px-5 py-3">
                Category
              </th>
              <SortHeader
                label="Price"
                field="price"
                active={sortField}
                direction={sortDirection}
                onSort={onSort}
              />
              <SortHeader
                label="Stock"
                field="stock_quantity"
                active={sortField}
                direction={sortDirection}
                onSort={onSort}
              />
              <th scope="col" className="px-5 py-3">
                Status
              </th>
              <th scope="col" className="px-5 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const thumbnail = pickThumbnail(product);
              return (
                <tr key={product.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-slate-400">
                          N/A
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(product.created_at)}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-600">
                    {product.sku}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {product.brand.name}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {product.category.name}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-900">
                    {priceFormatter.format(Number(product.price))}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {product.stock_quantity}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <StatusBadge isActive={product.is_active} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => onView(product)}
                        className="text-slate-600 transition hover:text-slate-900"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="text-blue-600 transition hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="text-rose-600 transition hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-slate-400"
        }`}
        aria-hidden="true"
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function SortHeader({
  label,
  field,
  active,
  direction,
  onSort,
}: {
  label: string;
  field: ProductSortField;
  active: ProductSortField;
  direction: SortDirection;
  onSort: (field: ProductSortField) => void;
}) {
  const isActive = active === field;
  return (
    <th scope="col" className="px-5 py-3">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 uppercase tracking-wide transition ${
          isActive ? "text-slate-900" : "hover:text-slate-700"
        }`}
      >
        {label}
        <span aria-hidden="true" className="text-[10px] leading-none">
          {isActive ? (direction === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}