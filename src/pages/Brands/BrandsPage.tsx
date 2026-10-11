import { useCallback, useEffect, useState } from "react";
import {
  createBrand,
  deleteBrand,
  getBrand,
  listBrands,
  updateBrand,
} from "../../api/admin/brands";
import { getErrorMessage, isValidationError } from "../../lib/axios";
import { useDebounce } from "../../hooks/useDebounce";
import BrandTable from "../../components/brands/BrandTable";
import BrandFormDialog from "../../components/brands/BrandFormDialog";
import BrandViewDialog from "../../components/brands/BrandViewDialog";
import DeleteBrandDialog from "../../components/brands/DeleteBrandDialog";
import type {
  Brand,
  BrandDetails,
  BrandPaginationMeta,
  BrandSortField,
  SortDirection,
} from "../../types";

interface BrandFieldErrors {
  name?: string;
  brand_image?: string;
}

export default function BrandsPage() {
  // List state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [meta, setMeta] = useState<BrandPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Query state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<BrandSortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Brand | null>(null);
  const [viewTargetId, setViewTargetId] = useState<number | null>(null);
  const [viewDetails, setViewDetails] = useState<BrandDetails | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  // Dialog submit state
  const [isSaving, setIsSaving] = useState(false);
  const [formFieldErrors, setFormFieldErrors] = useState<BrandFieldErrors>({});
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
      const response = await listBrands({
        page,
        search: debouncedSearch || undefined,
        sort: sortField,
        direction: sortDirection,
      });

      if (response.data.length === 0 && response.meta.current_page > 1) {
        setPage(response.meta.current_page - 1);
        return;
      }

      setBrands(response.data);
      setMeta(response.meta);
    } catch (error) {
      setListError(getErrorMessage(error, "Failed to load brands."));
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, sortField, sortDirection]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  /* ---------- Sorting ---------- */

  const handleSort = (field: BrandSortField) => {
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

  /* ---------- Field error helpers ---------- */

  const resetFormErrors = () => {
    setFormError(null);
    setFormFieldErrors({});
  };

  const applyValidationErrors = (error: unknown): boolean => {
    if (!isValidationError(error)) return false;
    const errors = error.response.data.errors;
    setFormFieldErrors({
      name: errors.name?.[0],
      brand_image: errors.brand_image?.[0],
    });
    setFormError(error.response.data.message ?? null);
    return true;
  };

  /* ---------- Create ---------- */

  const openCreate = () => {
    resetFormErrors();
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (
    name: string,
    brandImage: File | null,
  ) => {
    setIsSaving(true);
    resetFormErrors();
    try {
      await createBrand({ name, brand_image: brandImage });
      setCreateOpen(false);
      setSuccessMessage("Brand created successfully.");
      await fetchList();
    } catch (error) {
      if (!applyValidationErrors(error)) {
        setFormError(getErrorMessage(error, "Failed to create brand."));
      }
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------- Edit ---------- */

  const openEdit = (brand: Brand) => {
    resetFormErrors();
    setEditTarget(brand);
  };

  const handleEditSubmit = async (
    name: string,
    brandImage: File | null,
  ) => {
    if (!editTarget) return;
    setIsSaving(true);
    resetFormErrors();
    try {
      await updateBrand(editTarget.id, { name, brand_image: brandImage });
      setEditTarget(null);
      setSuccessMessage("Brand updated successfully.");
      await fetchList();
    } catch (error) {
      if (!applyValidationErrors(error)) {
        setFormError(getErrorMessage(error, "Failed to update brand."));
      }
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------- View ---------- */

  const openView = async (brand: Brand) => {
    setViewTargetId(brand.id);
    setViewDetails(null);
    setViewError(null);
    setViewLoading(true);
    try {
      const details = await getBrand(brand.id);
      setViewDetails(details);
    } catch (error) {
      setViewError(getErrorMessage(error, "Failed to load brand."));
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

  const openDelete = (brand: Brand) => {
    setDeleteError(null);
    setDeleteTarget(brand);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteBrand(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMessage("Brand deleted successfully.");
      await fetchList();
    } catch (error) {
      setDeleteError(
        getErrorMessage(error, "Failed to delete brand. Please try again."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* ---------- Render ---------- */

  const hasSearch = debouncedSearch.trim().length > 0;
  const isEmpty = !isLoading && !listError && brands.length === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Catalogue
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Brands
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage the brands available in your networking equipment catalogue.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Add Brand
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
          <label htmlFor="brand-search" className="sr-only">
            Search brands
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
            id="brand-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search brands…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        {meta && !isLoading && (
          <p className="text-xs text-slate-500">
            {meta.total} {meta.total === 1 ? "brand" : "brands"}
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

        {!isLoading && !listError && brands.length > 0 && (
          <>
            <BrandTable
              brands={brands}
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
      <BrandFormDialog
        isOpen={createOpen}
        mode="create"
        isSubmitting={isSaving}
        fieldError={formFieldErrors.name}
        imageError={formFieldErrors.brand_image}
        formError={formError}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <BrandFormDialog
        isOpen={editTarget !== null}
        mode="edit"
        initialName={editTarget?.name ?? ""}
        initialImageUrl={editTarget?.brand_image_url ?? null}
        isSubmitting={isSaving}
        fieldError={formFieldErrors.name}
        imageError={formFieldErrors.brand_image}
        formError={formError}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
      />

      <BrandViewDialog
        isOpen={viewTargetId !== null}
        isLoading={viewLoading}
        details={viewDetails}
        error={viewError}
        onClose={closeView}
      />

      <DeleteBrandDialog
        isOpen={deleteTarget !== null}
        brand={deleteTarget}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

/* ---------- Inline sub-components (unchanged from before, plus image column) ---------- */

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
            <div className="h-10 w-10 rounded-lg bg-slate-100" />
            <div className="h-4 w-40 rounded bg-slate-100" />
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
        Couldn't load brands
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
        {hasSearch ? "No brands match your search" : "No brands yet"}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {hasSearch
          ? "Try changing your search or create a new brand."
          : "Create your first brand to organise the catalogue."}
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Add Brand
      </button>
    </div>
  );
}

function Pagination({
  meta,
  onPageChange,
}: {
  meta: BrandPaginationMeta;
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