import { appConfig, isLiveApiMode } from "@/shared/config";
import { httpJson } from "@/shared/http";
import type { CartLine, Order, OrderStatus, PaymentMethod } from "@/shared/order.types";
import {
  createMockOrder,
  getMockOrder,
  getMockOrders,
  manualAdvanceMockOrder,
  subscribeMockOrders,
} from "./order.mock";

export async function createOrder(input: {
  customer: Order["customer"];
  lines: CartLine[];
  paymentMethod: PaymentMethod;
}) {
  if (!isLiveApiMode()) {
    return createMockOrder(input);
  }

  return httpJson<Order>(`${appConfig.orderServiceUrl}/orders`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getOrder(orderId: string) {
  if (!isLiveApiMode()) {
    return getMockOrder(orderId);
  }

  return httpJson<Order>(`${appConfig.orderServiceUrl}/orders/${orderId}`);
}

export async function getAllOrders() {
  if (!isLiveApiMode()) {
    return getMockOrders();
  }

  const orders = await httpJson<Order[]>(`${appConfig.orderServiceUrl}/orders`);
  return Object.fromEntries(orders.map((order) => [order.id, order])) as Record<string, Order>;
}

export function subscribe(listener: (orders: Record<string, Order>) => void) {
  if (!isLiveApiMode()) {
    return subscribeMockOrders(listener);
  }

  void getAllOrders().then(listener);
  return () => {};
}

export async function manualAdvance(orderId: string, target: OrderStatus) {
  if (!isLiveApiMode()) {
    return manualAdvanceMockOrder(orderId, target);
  }

  await httpJson<void>(`${appConfig.orderServiceUrl}/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: target }),
  });
}
