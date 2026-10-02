import type { Brand, BrandSortField, SortDirection } from "../../types";

interface BrandTableProps {
  brands: Brand[];
  sortField: BrandSortField;
  sortDirection: SortDirection;
  onSort: (field: BrandSortField) => void;
  onView: (brand: Brand) => void;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export default function BrandTable({
  brands,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
}: BrandTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <SortHeader
                label="Name"
                field="name"
                active={sortField}
                direction={sortDirection}
                onSort={onSort}
              />
              <SortHeader
                label="Created"
                field="created_at"
                active={sortField}
                direction={sortDirection}
                onSort={onSort}
              />
              <th scope="col" className="px-5 py-3">
                Updated
              </th>
              <th scope="col" className="px-5 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3.5 font-medium text-slate-900">
                  {brand.name}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                  {formatDate(brand.created_at)}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                  {formatDate(brand.updated_at)}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-3 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => onView(brand)}
                      className="text-slate-600 transition hover:text-slate-900"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(brand)}
                      className="text-blue-600 transition hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(brand)}
                      className="text-rose-600 transition hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
  field: BrandSortField;
  active: BrandSortField;
  direction: SortDirection;
  onSort: (field: BrandSortField) => void;
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