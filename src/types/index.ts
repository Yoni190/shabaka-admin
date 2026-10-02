export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin";
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export type AdminLoginFieldErrors = Partial<
  Record<keyof AdminLoginPayload, string>
>;

export interface CatalogueStats {
  total_products: number;
  active_products: number;
  inactive_products: number;
  total_categories: number;
  total_brands: number;
  out_of_stock_products: number;
}

export interface CustomerStats {
  total_business_customers: number;
  recently_registered: number;
}

export interface RecentCustomerBusiness {
  id: number;
  name: string;
}

export interface RecentCustomer {
  id: number;
  name: string;
  email: string;
  business_id: number | null;
  created_at: string;
  business: RecentCustomerBusiness | null;
}

export interface DashboardData {
  catalogue: CatalogueStats;
  customers: CustomerStats;
  recent_customers: RecentCustomer[];
}

/** Laravel wraps the payload in a `data` key. */
export interface DashboardResponse {
  data: DashboardData;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryDetails extends Category {
  products_count: number;
}

export interface CategoryPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface CategoryListResponse {
  data: Category[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: CategoryPaginationMeta;
}

export interface CategoryDetailsResponse {
  data: CategoryDetails;
}

export interface CreateCategoryPayload {
  name: string;
}

export type UpdateCategoryPayload = CreateCategoryPayload;

export type CategorySortField = "name" | "created_at";
export type SortDirection = "asc" | "desc";

export interface Brand {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BrandDetails extends Brand {
  products_count: number;
}

export interface BrandPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface BrandListResponse {
  data: Brand[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: BrandPaginationMeta;
}

export interface BrandDetailsResponse {
  data: BrandDetails;
}

export interface CreateBrandPayload {
  name: string;
}

export type UpdateBrandPayload = CreateBrandPayload;

export type BrandSortField = "name" | "created_at";