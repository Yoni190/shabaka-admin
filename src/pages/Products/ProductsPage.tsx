import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  deleteProduct,
  getProduct,
  listProducts,
} from "../../api/admin/products";
import { getErrorMessage } from "../../lib/axios";
import { useDebounce } from "../../hooks/useDebounce";
import { useCatalogueOptions } from "../../hooks/useCatalogueOptions";
import ProductTable from "../../components/products/ProductTable";
import ProductFilters, {
  type ProductFilterValues,
} from "../../components/products/ProductFilters";
import ProductViewDialog from "../../components/products/ProductViewDialog";
import DeleteProductDialog from "../../components/products/DeleteProductDialog";
import type {
  Product,
  ProductPaginationMeta,
  ProductSortField,
  SortDirection,
} from "../../types";

interface FlashState {
  success?: string;
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // List state
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ProductPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Query state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<ProductSortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filters, setFilters] = useState<ProductFilterValues>({
    category_id: "",
    brand_id: "",
    is_active: "",
  });

  // Flash message coming from create/edit pages after a successful submit.
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dropdown options for filters.
  const {
    categories,
    brands,
    isLoading: optionsLoading,
  } = useCatalogueOptions();

  // View / delete dialog state
  const [viewTargetId, setViewTargetId] = useState<number | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* ---------- Flash from navigation state ---------- */

  useEffect(() => {
    const state = location.state as FlashState | null;
    if (state?.success) {
      setSuccessMessage(state.success);
      // Clear navigation state so a refresh doesn't re-show the banner.
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  /* ---------- Fetch list ---------- */

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const response = await listProducts({
        page,
        search: debouncedSearch || undefined,
        category_id: filters.category_id || undefined,
        brand_id: filters.brand_id || undefined,
        is_active: filters.is_active || undefined,
        sort: sortField,
        direction: sortDirection,
      });

      if (response.data.length === 0 && response.meta.current_page > 1) {
        setPage(response.meta.current_page - 1);
        return;
      }

      setProducts(response.data);
      setMeta(response.meta);
    } catch (error) {
      setListError(getErrorMessage(error, "Failed to load products."));
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, filters, sortField, sortDirection]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  // Reset to page 1 whenever search or filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  /* ---------- Sorting ---------- */

  const handleSort = (field: ProductSortField) => {
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

  /* ---------- View ---------- */

  const openView = async (product: Product) => {
    setViewTargetId(product.id);
    setViewProduct(null);
    setViewError(null);
    setViewLoading(true);
    try {
      const details = await getProduct(product.id);
      setViewProduct(details);
    } catch (error) {
      setViewError(getErrorMessage(error, "Failed to load product."));
    } finally {
      setViewLoading(false);
    }
  };

  const closeView = () => {
    setViewTargetId(null);
    setViewProduct(null);
    setViewError(null);
  };

  /* ---------- Delete ---------- */

  const openDelete = (product: Product) => {
    setDeleteError(null);
    setDeleteTarget(product);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMessage("Product deleted successfully.");
      await fetchList();
    } catch (error) {
      setDeleteError(
        getErrorMessage(error, "Failed to delete product. Please try again."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* ---------- Render ---------- */

  const hasSearch = debouncedSearch.trim().length > 0;
  const hasFilters =
    filters.category_id !== "" ||
    filters.brand_id !== "" ||
    filters.is_active !== "";
  const isEmpty = !isLoading && !listError && products.length === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Catalogue
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage the networking equipment in your catalogue.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/products/create")}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Add Product
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
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <label htmlFor="product-search" className="sr-only">
              Search products
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
              id="product-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or SKU…"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {meta && !isLoading && (
            <p className="text-xs text-slate-500">
              {meta.total} {meta.total === 1 ? "product" : "products"}
            </p>
          )}
        </div>

        <ProductFilters
          values={filters}
          onChange={setFilters}
          categories={categories}
          brands={brands}
          isLoading={optionsLoading}
        />
      </div>

      {/* Body */}
      <div className="mt-4">
        {isLoading && <TableSkeleton />}

        {!isLoading && listError && (
          <ErrorState message={listError} onRetry={fetchList} />
        )}

        {!isLoading && !listError && isEmpty && (
          <EmptyState
            hasSearch={hasSearch}
            hasFilters={hasFilters}
            onCreate={() => navigate("/admin/products/create")}
          />
        )}

        {!isLoading && !listError && products.length > 0 && (
          <>
            <ProductTable
              products={products}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onView={openView}
              onEdit={(product) =>
                navigate(`/admin/products/${product.id}/edit`)
              }
              onDelete={openDelete}
            />

            {meta && meta.last_page > 1 && (
              <Pagination meta={meta} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <ProductViewDialog
        isOpen={viewTargetId !== null}
        isLoading={viewLoading}
        product={viewProduct}
        error={viewError}
        onClose={closeView}
      />

      <DeleteProductDialog
        isOpen={deleteTarget !== null}
        product={deleteTarget}
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
        Couldn't load products
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
  hasFilters,
  onCreate,
}: {
  hasSearch: boolean;
  hasFilters: boolean;
  onCreate: () => void;
}) {
  const isFiltered = hasSearch || hasFilters;
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-semibold text-slate-900">
        {isFiltered ? "No products match your filters" : "No products yet"}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {isFiltered
          ? "Try changing your search or filters, or add a new product."
          : "Add your first product to start building the catalogue."}
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Add Product
      </button>
    </div>
  );
}

function Pagination({
  meta,
  onPageChange,
}: {
  meta: ProductPaginationMeta;
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