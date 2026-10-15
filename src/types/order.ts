/**
 * Status values match the backend enum. Kept as a union plus a runtime
 * list so the UI can iterate them in select options.
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "refunded"
  | "partially_refunded";

/** Snapshot of an address stored on the order at creation time. */
export interface OrderAddressSnapshot {
  recipient_name: string;
  company_name: string | null;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state_or_region: string | null;
  postal_code: string;
  country_code: string;
}

/** Item as returned by AdminOrderDetailResource. */
export interface AdminOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

/** Row from AdminOrderListResource. */
export interface AdminOrderListItem {
  id: number;
  order_number: string;
  business_id: number | null;
  /** Only present when the controller eager-loads `business`. */
  business_name?: string | null;
  /** Only present when the controller eager-loads `user`. */
  user_name?: string | null;
  user_email?: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  discount_amount: string;
  total_amount: string;
  currency: string;
  created_at: string;
}

/** Full payload from AdminOrderDetailResource. */
export interface AdminOrderDetail {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  discount_amount: string;
  total_amount: string;
  currency: string;
  notes: string | null;
  business?: { id: number; name: string } | null;
  user?: { id: number; name: string; email: string } | null;
  shipping_address: OrderAddressSnapshot | null;
  billing_address: OrderAddressSnapshot | null;
  items?: AdminOrderItem[];
  stock_restored_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminOrderPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface AdminOrderListResponse {
  data: AdminOrderListItem[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: AdminOrderPaginationMeta;
}

export interface AdminOrderDetailResponse {
  data: AdminOrderDetail;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}