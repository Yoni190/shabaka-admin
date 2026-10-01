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