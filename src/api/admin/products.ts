import { api } from "../../lib/axios";
import type {
  Product,
  ProductDetailsResponse,
  ProductListResponse,
  ProductSortField,
  SortDirection,
} from "../../types";

export interface ListProductsParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: string | number;
  brand_id?: string | number;
  /** Send "1" for active, "0" for inactive. Omit for all. */
  is_active?: "0" | "1";
  sort?: ProductSortField;
  direction?: SortDirection;
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<ProductListResponse> {
  const { data } = await api.get<ProductListResponse>("/admin/products", {
    params,
  });
  return data;
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await api.get<ProductDetailsResponse>(
    `/admin/products/${id}`,
  );
  return data.data;
}

/**
 * Both create and update accept FormData because images are uploaded as files.
 * The browser sets the multipart boundary automatically — do not set
 * Content-Type manually.
 */
export async function createProduct(formData: FormData) {
  const { data } = await api.post("/admin/products", formData);
  return data;
}

export async function updateProduct(id: number, formData: FormData) {
  // Laravel does not parse multipart on PUT — use method spoofing via POST.
  formData.append("_method", "PUT");
  const { data } = await api.post(`/admin/products/${id}`, formData);
  return data;
}

export async function deleteProduct(id: number) {
  const { data } = await api.delete(`/admin/products/${id}`);
  return data;
}