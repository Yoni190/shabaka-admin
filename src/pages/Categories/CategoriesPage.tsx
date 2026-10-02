import { useCallback, useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "../../api/admin/categories";
import { getErrorMessage, isValidationError } from "../../lib/axios";
import { useDebounce } from "../../hooks/useDebounce";
import CategoryTable from "../../components/categories/CategoryTable";
import CategoryFormDialog from "../../components/categories/CategoryFormDialog";
import CategoryViewDialog from "../../components/categories/CategoryViewDialog";
import DeleteCategoryDialog from "../../components/categories/DeleteCategoryDialog";
import type {
  Category,
  CategoryDetails,
  CategoryPaginationMeta,
  CategorySortField,
  SortDirection,
} from "../../types";

export default function CategoriesPage() {
  // List state
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<CategoryPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Query state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<CategorySortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [viewTargetId, setViewTargetId] = useState<number | null>(null);
  const [viewDetails, setViewDetails] = useState<CategoryDetails | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Dialog submit state
  const [isSaving, setIsSaving] = useState(false);
  const [formFieldError, setFormFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Inline success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /* ---------- Fetch list ---------- */

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const response = await listCategories({
        page,
        search: debouncedSearch || undefined,
        sort: sortField,
        direction: sortDirection,
      });

      // If we land on an empty page that isn't page 1 (e.g. after deleting
      // the last item on the last page), step back one page.
      if (response.data.length === 0 && response.meta.current_page > 1) {
        setPage(response.meta.current_page - 1);
        return;
      }

      setCategories(response.data);
      setMeta(response.meta);
    } catch (error) {
      setListError(getErrorMessage(error, "Failed to load categories."));
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, sortField, sortDirection]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  // Reset to page 1 whenever the search term changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Auto-dismiss success banner.
  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  /* ---------- Sorting ---------- */

  const handleSort = (field: CategorySortField) => {
    if (field === sortField) {
      setSortDirection((direction) =>
        direction === "asc" ? "desc" : "asc",
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setPage(1);
  };

  /* ---------- Create ---------- */

  const openCreate = () => {
    setFormError(null);
    setFormFieldError(undefined);
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (name: string) => {
    setIsSaving(true);
    setFormError(null);
    setFormFieldError(undefined);
    try {
      await createCategory({ name });
      setCreateOpen(false);
      setSuccessMessage("Category created successfully.");
      await fetchList();
    } catch (error) {
      if (isValidationError(error)) {
        const message = error.response.data.errors.name?.[0];
        setFormFieldError(message);
        setFormError(error.response.data.message ?? null);
      } else {
        setFormError(getErrorMessage(error, "Failed to create category."));
      }
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------- Edit ---------- */

  const openEdit = (category: Category) => {
    setFormError(null);
    setFormFieldError(undefined);
    setEditTarget(category);
  };

  const handleEditSubmit = async (name: string) => {
    if (!editTarget) return;
    setIsSaving(true);
    setFormError(null);
    setFormFieldError(undefined);
    try {
      await updateCategory(editTarget.id, { name });
      setEditTarget(null);
      setSuccessMessage("Category updated successfully.");
      await fetchList();
    } catch (error) {
      if (isValidationError(error)) {
        const message = error.response.data.errors.name?.[0];
        setFormFieldError(message);
        setFormError(error.response.data.message ?? null);
      } else {
        setFormError(getErrorMessage(error, "Failed to update category."));
      }
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------- View ---------- */

  const openView = async (category: Category) => {
    setViewTargetId(category.id);
    setViewDetails(null);
    setViewError(null);
    setViewLoading(true);
    try {
      const details = await getCategory(category.id);
      setViewDetails(details);
    } catch (error) {
      setViewError(getErrorMessage(error, "Failed to load category."));
    } finally {
      setViewLoading(false);
    }
  };

  const closeView = () => {
    setViewTargetId(null);
    setViewDetails(null);
    setViewError(null);
  };

  /* ---------- Delete ---------- */

  const openDelete = (category: Category) => {
    setDeleteError(null);
    setDeleteTarget(category);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMessage("Category deleted successfully.");
      await fetchList();
    } catch (error) {
      // Handles 409 (products assigned) with the backend's own message,
      // and any other failure with a friendly fallback.
      setDeleteError(
        getErrorMessage(error, "Failed to delete category. Please try again."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* ---------- Render ---------- */

  const hasSearch = debouncedSearch.trim().length > 0;
  const isEmpty = !isLoading && !listError && categories.length === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Catalogue
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Categories
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage product categories for your networking catalogue.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {successMessage}
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <label htmlFor="category-search" className="sr-only">
            Search categories
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
            id="category-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search categories…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        {meta && !isLoading && (
          <p className="text-xs text-slate-500">
            {meta.total} {meta.total === 1 ? "category" : "categories"}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="mt-4">
        {isLoading && <TableSkeleton />}

        {!isLoading && listError && (
          <ErrorState message={listError} onRetry={fetchList} />
        )}

        {!isLoading && !listError && isEmpty && (
          <EmptyState hasSearch={hasSearch} onCreate={openCreate} />
        )}

        {!isLoading && !listError && categories.length > 0 && (
          <>
            <CategoryTable
              categories={categories}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onView={openView}
              onEdit={openEdit}
              onDelete={openDelete}
            />

            {meta && meta.last_page > 1 && (
              <Pagination meta={meta} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <CategoryFormDialog
        isOpen={createOpen}
        mode="create"
        isSubmitting={isSaving}
        fieldError={formFieldError}
        formError={formError}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <CategoryFormDialog
        isOpen={editTarget !== null}
        mode="edit"
        initialName={editTarget?.name ?? ""}
        isSubmitting={isSaving}
        fieldError={formFieldError}
        formError={formError}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
      />

      <CategoryViewDialog
        isOpen={viewTargetId !== null}
        isLoading={viewLoading}
        details={viewDetails}
        error={viewError}
        onClose={closeView}
      />

      <DeleteCategoryDialog
        isOpen={deleteTarget !== null}
        category={deleteTarget}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
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
            <div className="h-4 w-40 rounded bg-slate-100" />
            <div className="h-4 w-24 rounded bg-slate-100" />
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
        Couldn't load categories
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

function EmptyState({
  hasSearch,
  onCreate,
}: {
  hasSearch: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-semibold text-slate-900">
        {hasSearch ? "No categories match your search" : "No categories yet"}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {hasSearch
          ? "Try changing your search or create a new category."
          : "Create your first category to organise the catalogue."}
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Add Category
      </button>
    </div>
  );
}

function Pagination({
  meta,
  onPageChange,
}: {
  meta: CategoryPaginationMeta;
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