import SelectField from "../ui/SelectField";
import type { Brand, Category } from "../../types";

export interface ProductFilterValues {
  category_id: string;
  brand_id: string;
  is_active: "" | "0" | "1";
}

interface ProductFiltersProps {
  values: ProductFilterValues;
  onChange: (values: ProductFilterValues) => void;
  categories: Category[];
  brands: Brand[];
  isLoading: boolean;
}

export default function ProductFilters({
  values,
  onChange,
  categories,
  brands,
  isLoading,
}: ProductFiltersProps) {
  const update = <K extends keyof ProductFilterValues>(
    field: K,
    value: ProductFilterValues[K],
  ) => onChange({ ...values, [field]: value });

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SelectField
        id="filter-category"
        label="Category"
        value={values.category_id}
        onChange={(value) => update("category_id", value)}
        options={categories.map((category) => ({
          value: String(category.id),
          label: category.name,
        }))}
        placeholder="All categories"
        disabled={isLoading}
      />

      <SelectField
        id="filter-brand"
        label="Brand"
        value={values.brand_id}
        onChange={(value) => update("brand_id", value)}
        options={brands.map((brand) => ({
          value: String(brand.id),
          label: brand.name,
        }))}
        placeholder="All brands"
        disabled={isLoading}
      />

      <SelectField
        id="filter-status"
        label="Status"
        value={values.is_active}
        onChange={(value) =>
          update("is_active", value as ProductFilterValues["is_active"])
        }
        options={[
          { value: "1", label: "Active" },
          { value: "0", label: "Inactive" },
        ]}
        placeholder="All"
      />
    </div>
  );
}