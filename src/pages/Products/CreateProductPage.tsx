import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm, {
  type ProductFormSubmit,
} from "../../components/products/ProductForm";
import { createProduct } from "../../api/admin/products";
import { getErrorMessage, isValidationError } from "../../lib/axios";
import { useCatalogueOptions } from "../../hooks/useCatalogueOptions";
import type {
  ProductFieldErrors,
  ProductFormValues,
} from "../../types";

const initialValues: ProductFormValues = {
  name: "",
  sku: "",
  description: "",
  category_id: "",
  brand_id: "",
  price: "",
  stock_quantity: "",
  is_active: "1",
};

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { categories, brands, isLoading: optionsLoading } =
    useCatalogueOptions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async ({
    values,
    newFiles,
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
    newFiles.forEach((file) => formData.append("images[]", file));

    try {
      await createProduct(formData);
      navigate("/admin/products", {
        state: { success: "Product created successfully." },
      });
    } catch (error) {
      if (isValidationError(error)) {
        const { errors, message } = error.response.data;
        const flattened: ProductFieldErrors = {};
        for (const [field, messages] of Object.entries(errors)) {
          // Laravel returns image errors as `images.0`, `images.1`, ...
          const key = field.startsWith("images") ? "name" : field;
          if (!flattened[key as keyof ProductFieldErrors]) {
            flattened[key as keyof ProductFieldErrors] = messages[0];
          }
        }
        setFieldErrors(flattened);
        setFormError(message ?? "Please correct the highlighted fields.");
      } else {
        setFormError(
          getErrorMessage(error, "Failed to create product. Please try again."),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 lg:px-8 lg:py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
        Catalogue
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        Add product
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Add a new item to your networking equipment catalogue.
      </p>

      <div className="mt-8">
        <ProductForm
          mode="create"
          initialValues={initialValues}
          categories={categories}
          brands={brands}
          optionsLoading={optionsLoading}
          existingImages={[]}
          isSubmitting={isSubmitting}
          fieldErrors={fieldErrors}
          formError={formError}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/products")}
        />
      </div>
    </div>
  );
}