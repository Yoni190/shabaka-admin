import { api } from "../../lib/axios";
import type {
  BrandDetails,
  BrandFormPayload,
  BrandListResponse,
  BrandSortField,
  SortDirection,
} from "../../types";

export interface ListBrandsParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: BrandSortField;
  direction?: SortDirection;
}

export async function listBrands(
  params: ListBrandsParams = {},
): Promise<BrandListResponse> {
  const { data } = await api.get<BrandListResponse>("/admin/brands", {
    params,
  });
  return data;
}

export async function getBrand(id: number): Promise<BrandDetails> {
  const { data } = await api.get<{ data: BrandDetails }>(
    `/admin/brands/${id}`,
  );
  return data.data;
}

/**
 * Build the multipart body. The backend expects the file under
 * `brand_image`. When updating, we spoof `PUT` via `_method` because PHP
 * does not parse multipart bodies on a raw PUT request.
 */
function buildBrandFormData(
  payload: BrandFormPayload,
  spoofPut = false,
): FormData {
  const formData = new FormData();
  formData.append("name", payload.name);
  if (payload.brand_image) {
    formData.append("brand_image", payload.brand_image);
  }
  if (spoofPut) {
    formData.append("_method", "PUT");
  }
  return formData;
}

export async function createBrand(payload: BrandFormPayload) {
  const { data } = await api.post(
    "/admin/brands",
    buildBrandFormData(payload),
  );
  return data;
}

export async function updateBrand(id: number, payload: BrandFormPayload) {
  const { data } = await api.post(
    `/admin/brands/${id}`,
    buildBrandFormData(payload, true),
  );
  return data;
}

export async function deleteBrand(id: number) {
  const { data } = await api.delete(`/admin/brands/${id}`);
  return data;
}