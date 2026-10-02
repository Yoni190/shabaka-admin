import { api } from "../../lib/axios";
import type {
  BrandDetails,
  BrandListResponse,
  BrandSortField,
  CreateBrandPayload,
  SortDirection,
  UpdateBrandPayload,
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

export async function createBrand(payload: CreateBrandPayload) {
  const { data } = await api.post("/admin/brands", payload);
  return data;
}

export async function updateBrand(id: number, payload: UpdateBrandPayload) {
  const { data } = await api.put(`/admin/brands/${id}`, payload);
  return data;
}

export async function deleteBrand(id: number) {
  const { data } = await api.delete(`/admin/brands/${id}`);
  return data;
}