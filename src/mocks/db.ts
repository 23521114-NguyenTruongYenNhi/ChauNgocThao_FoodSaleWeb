import type { Delivery, Order, Payment } from "@/shared/order.types";

type OrderListener = (orders: Record<string, Order>) => void;

export const mockDb = {
  orders: {} as Record<string, Order>,
  payments: {} as Record<string, Payment>,
  deliveries: {} as Record<string, Delivery>,
};

const orderListeners = new Set<OrderListener>();

export function emitOrders() {
  const snapshot = { ...mockDb.orders };
  for (const listener of orderListeners) {
    listener(snapshot);
  }
}

export function subscribeOrders(listener: OrderListener) {
  orderListeners.add(listener);
  listener({ ...mockDb.orders });
  return () => {
    orderListeners.delete(listener);
  };
}
