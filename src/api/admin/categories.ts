import { api } from "../../lib/axios";
import type {
  CategoryDetails,
  CategoryListResponse,
  CategorySortField,
  CreateCategoryPayload,
  SortDirection,
  UpdateCategoryPayload,
} from "../../types";

export interface ListCategoriesParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: CategorySortField;
  direction?: SortDirection;
}

export async function listCategories(
  params: ListCategoriesParams = {},
): Promise<CategoryListResponse> {
  const { data } = await api.get<CategoryListResponse>("/admin/categories", {
    params,
  });
  return data;
}

export async function getCategory(id: number): Promise<CategoryDetails> {
  const { data } = await api.get<{ data: CategoryDetails }>(
    `/admin/categories/${id}`,
  );
  return data.data;
}

export async function createCategory(payload: CreateCategoryPayload) {
  const { data } = await api.post("/admin/categories", payload);
  return data;
}

export async function updateCategory(
  id: number,
  payload: UpdateCategoryPayload,
) {
  const { data } = await api.put(`/admin/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: number) {
  const { data } = await api.delete(`/admin/categories/${id}`);
  return data;
}