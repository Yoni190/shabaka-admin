import { api } from "../../lib/axios";
import type {
  AdminOrderDetail,
  AdminOrderListResponse,
  OrderStatus,
  UpdateOrderStatusPayload,
} from "../../types/order";

export interface ListOrdersParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: OrderStatus;
}

export async function listOrders(
  params: ListOrdersParams = {},
): Promise<AdminOrderListResponse> {
  const { data } = await api.get<AdminOrderListResponse>("/admin/orders", {
    params,
  });
  return data;
}

export async function getOrder(id: number): Promise<AdminOrderDetail> {
  const { data } = await api.get<{ data: AdminOrderDetail }>(
    `/admin/orders/${id}`,
  );
  return data.data;
}

/**
 * Update an order's status. The backend validates which transitions are
 * allowed; sending an invalid one returns 422 with a `status` error key.
 */
export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<AdminOrderDetail> {
  const payload: UpdateOrderStatusPayload = { status };
  const { data } = await api.patch<{ data: AdminOrderDetail }>(
    `/admin/orders/${id}/status`,
    payload,
  );
  return data.data;
}