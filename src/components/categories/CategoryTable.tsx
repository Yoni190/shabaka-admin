import type { Category, CategorySortField, SortDirection } from "../../types";

interface CategoryTableProps {
  categories: Category[];
  sortField: CategorySortField;
  sortDirection: SortDirection;
  onSort: (field: CategorySortField) => void;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
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

export default function CategoryTable({
  categories,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
}: CategoryTableProps) {
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
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3.5 font-medium text-slate-900">
                  {category.name}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                  {formatDate(category.created_at)}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                  {formatDate(category.updated_at)}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-3 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => onView(category)}
                      className="text-slate-600 transition hover:text-slate-900"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(category)}
                      className="text-blue-600 transition hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(category)}
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
  field: CategorySortField;
  active: CategorySortField;
  direction: SortDirection;
  onSort: (field: CategorySortField) => void;
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