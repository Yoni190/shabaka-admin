import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm, {
  type ProductFormSubmit,
} from "../../components/products/ProductForm";
import { getProduct, updateProduct } from "../../api/admin/products";
import { getErrorMessage, isValidationError } from "../../lib/axios";
import { useCatalogueOptions } from "../../hooks/useCatalogueOptions";
import type {
  Product,
  ProductFieldErrors,
  ProductFormValues,
} from "../../types";

function toFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    description: product.description ?? "",
    category_id: String(product.category.id),
    brand_id: String(product.brand.id),
    price: product.price,
    stock_quantity: String(product.stock_quantity),
    is_active: product.is_active ? "1" : "0",
    is_featured: product.is_featured ? "1": "0",
  };
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const { categories, brands, isLoading: optionsLoading } =
    useCatalogueOptions();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  /* ---------- Load product ---------- */

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setLoadError("Invalid product id.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getProduct(productId);
        if (!cancelled) setProduct(data);
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            getErrorMessage(error, "Failed to load product."),
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  /* ---------- Submit ---------- */

  const handleSubmit = async ({
    values,
    newFiles,
    deleteImageIds,
  }: ProductFormSubmit) => {
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.append("category_id", values.category_id);
    formData.append("brand_id", values.brand_id);
    formData.append("name", values.name);
    formData.append("sku", values.sku);
    formData.append("description", values.description);
    formData.append("price", values.price);
    formData.append("stock_quantity", values.stock_quantity);
    formData.append("is_active", values.is_active);
    formData.append("is_featured", values.is_featured);

    // Only include new files — the backend never re-uploads existing ones.
    newFiles.forEach((file) => formData.append("images[]", file));

    // Only include delete markers when the admin removed something.
    deleteImageIds.forEach((imageId) =>
      formData.append("delete_image_ids[]", String(imageId)),
    );

    try {
      await updateProduct(productId, formData);
      navigate("/admin/products", {
        state: { success: "Product updated successfully." },
      });
    } catch (error) {
      if (isValidationError(error)) {
        const { errors, message } = error.response.data;
        const flattened: ProductFieldErrors = {};
        for (const [field, messages] of Object.entries(errors)) {
          const key = field.startsWith("images") ? "name" : field;
          if (!flattened[key as keyof ProductFieldErrors]) {
            flattened[key as keyof ProductFieldErrors] = messages[0];
          }
        }
        setFieldErrors(flattened);
        setFormError(message ?? "Please correct the highlighted fields.");
      } else {
        setFormError(
          getErrorMessage(error, "Failed to update product. Please try again."),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Render ---------- */

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 lg:px-8 lg:py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
        Catalogue
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        Edit product
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Update product details, inventory and images.
      </p>

      <div className="mt-8">
        {isLoading && <PageSkeleton />}

        {!isLoading && loadError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="text-sm font-semibold text-rose-800">
              Couldn't load product
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-rose-700">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Back to products
            </button>
          </div>
        )}

        {!isLoading && !loadError && product && (
          <ProductForm
            mode="edit"
            initialValues={toFormValues(product)}
            categories={categories}
            brands={brands}
            optionsLoading={optionsLoading}
            existingImages={product.images}
            isSubmitting={isSubmitting}
            fieldErrors={fieldErrors}
            formError={formError}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin/products")}
          />
        )}
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-200 bg-white p-6"
        >
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="mt-4 space-y-3">
            <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}