import { useEffect, useState } from "react";
import { listCategories } from "../api/admin/categories";
import { listBrands } from "../api/admin/brands";
import type { Category, Brand } from "../types";

interface CatalogueOptions {
  categories: Category[];
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
}

export function useCatalogueOptions(): CatalogueOptions {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          listCategories({ per_page: 100, sort: "name", direction: "asc" }),
          listBrands({ per_page: 100, sort: "name", direction: "asc" }),
        ]);
        if (cancelled) return;
        setCategories(categoriesRes.data);
        setBrands(brandsRes.data);
      } catch {
        if (!cancelled) {
          setError("Failed to load categories and brands.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, brands, isLoading, error };
}