import { useState, type FormEvent } from "react";
import FormField from "../ui/FormField";
import SelectField from "../ui/SelectField";
import TextareaField from "../ui/TextareaField";
import ProductImageUploader from "./ProductImageUploader";
import type {
  Brand,
  Category,
  ProductFieldErrors,
  ProductFormValues,
  ProductImage,
} from "../../types";

export interface ProductFormSubmit {
  values: ProductFormValues;
  newFiles: File[];
  deleteImageIds: number[];
}

interface ProductFormProps {
  mode: "create" | "edit";
  initialValues: ProductFormValues;
  categories: Category[];
  brands: Brand[];
  optionsLoading: boolean;
  existingImages: ProductImage[];
  isSubmitting: boolean;
  fieldErrors: ProductFieldErrors;
  formError: string | null;
  onSubmit: (submit: ProductFormSubmit) => void;
  onCancel: () => void;
}

const emptyImageError = "Please check the selected images.";

export default function ProductForm({
  mode,
  initialValues,
  categories,
  brands,
  optionsLoading,
  existingImages,
  isSubmitting,
  fieldErrors,
  formError,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);
  const [imageError, setImageError] = useState<string | undefined>();

  const update = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // The backend requires at least one image after edits are applied.
    const remainingExisting = existingImages.length - deleteImageIds.length;
    if (mode === "create" && newFiles.length === 0) {
      setImageError("Please upload at least one image.");
      return;
    }
    if (mode === "edit" && remainingExisting <= 0 && newFiles.length === 0) {
      setImageError("A product must have at least one image.");
      return;
    }
    setImageError(undefined);

    onSubmit({ values, newFiles, deleteImageIds });
  };

  const categoryOptions = categories.map((category) => ({
    value: String(category.id),
    label: category.name,
  }));
  const brandOptions = brands.map((brand) => ({
    value: String(brand.id),
    label: brand.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {formError}
        </div>
      )}

      <Section title="Product information">
        <FormField
          id="name"
          label="Product name"
          value={values.name}
          onChange={(value) => update("name", value)}
          error={fieldErrors.name}
          required
          placeholder="e.g. Cisco Catalyst 9200"
        />
        <FormField
          id="sku"
          label="SKU"
          value={values.sku}
          onChange={(value) => update("sku", value)}
          error={fieldErrors.sku}
          required
          placeholder="C9200-24T"
          hint="Must be unique."
        />
        <TextareaField
          id="description"
          label="Description"
          value={values.description}
          onChange={(value) => update("description", value)}
          error={fieldErrors.description}
          placeholder="Short description of the product."
        />
      </Section>

      <Section title="Classification">
        <SelectField
          id="category_id"
          label="Category"
          value={values.category_id}
          onChange={(value) => update("category_id", value)}
          options={categoryOptions}
          error={fieldErrors.category_id}
          required
          placeholder={optionsLoading ? "Loading…" : "Select a category"}
          disabled={optionsLoading}
        />
        <SelectField
          id="brand_id"
          label="Brand"
          value={values.brand_id}
          onChange={(value) => update("brand_id", value)}
          options={brandOptions}
          error={fieldErrors.brand_id}
          required
          placeholder={optionsLoading ? "Loading…" : "Select a brand"}
          disabled={optionsLoading}
        />
      </Section>

      <Section title="Pricing & inventory">
        <FormField
          id="price"
          label="Price"
          type="number"
          step="0.01"
          min="0"
          value={values.price}
          onChange={(value) => update("price", value)}
          error={fieldErrors.price}
          required
          placeholder="0.00"
          hint="Price per unit, including tax."
        />
        <FormField
          id="stock_quantity"
          label="Stock quantity"
          type="number"
          step="1"
          min="0"
          value={values.stock_quantity}
          onChange={(value) => update("stock_quantity", value)}
          error={fieldErrors.stock_quantity}
          required
          placeholder="0"
        />
      </Section>

      <Section title="Status">
        <SelectField
          id="is_active"
          label="Product status"
          value={values.is_active}
          onChange={(value) => update("is_active", value as "1" | "0")}
          options={[
            { value: "1", label: "Active" },
            { value: "0", label: "Inactive" },
          ]}
          error={fieldErrors.is_active}
          required
        />

        <SelectField
          id="is_featured"
          label="Featured Status"
          value={values.is_featured}
          onChange={(value) => update("is_featured", value as "1" | "0")}
          options={[
            { value: "1", label: "Active" },
            { value: "0", label: "Inactive" },
          ]}
          error={fieldErrors.is_featured}
          required
        />
      </Section>

      <Section title="Images">
        <ProductImageUploader
          existingImages={existingImages}
          deleteImageIds={deleteImageIds}
          onToggleExistingDelete={(id) =>
            setDeleteImageIds((prev) =>
              prev.includes(id)
                ? prev.filter((existing) => existing !== id)
                : [...prev, id],
            )
          }
          newFiles={newFiles}
          onAddFiles={(files) =>
            setNewFiles((prev) => [...prev, ...files])
          }
          onRemoveNewFile={(index) =>
            setNewFiles((prev) => prev.filter((_, i) => i !== index))
          }
          error={imageError}
        />
      </Section>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || optionsLoading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}