import { emitOrders, mockDb, subscribeOrders } from "@/mocks/db";
import type { CartLine, Order, OrderStatus, PaymentMethod } from "@/shared/order.types";

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function pushHistory(order: Order, status: OrderStatus, service: string, note?: string) {
  order.status = status;
  order.history.push({ status, at: Date.now(), service, note });
}

export function createMockOrder(input: {
  customer: Order["customer"];
  lines: CartLine[];
  paymentMethod: PaymentMethod;
}) {
  const total = input.lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  const id = newId("ORD");

  const order: Order = {
    id,
    createdAt: Date.now(),
    customer: input.customer,
    lines: input.lines,
    total,
    paymentMethod: input.paymentMethod,
    status: "PENDING_PAYMENT",
    payment: {
      orderId: id,
      method: input.paymentMethod,
      status: "PENDING",
    },
    history: [],
  };

  pushHistory(order, "PENDING_PAYMENT", "Order Service", "Order created, awaiting payment.");
  mockDb.orders[id] = order;
  emitOrders();
  return order;
}

export function getMockOrder(orderId: string) {
  return mockDb.orders[orderId];
}

export function getMockOrders() {
  return { ...mockDb.orders };
}

export function subscribeMockOrders(listener: (orders: Record<string, Order>) => void) {
  return subscribeOrders(listener);
}

export function updateMockOrderStatus(
  orderId: string,
  status: OrderStatus,
  service: string,
  note?: string,
) {
  const order = mockDb.orders[orderId];
  if (!order) return;

  pushHistory(order, status, service, note);
  emitOrders();
}

export function attachMockDeliveryToOrder(
  orderId: string,
  delivery: { id: string; etaMinutes: number; courier: string },
) {
  const order = mockDb.orders[orderId];
  if (!order) return;

  order.delivery = delivery;
  emitOrders();
}

export function manualAdvanceMockOrder(orderId: string, target: OrderStatus) {
  const order = mockDb.orders[orderId];
  if (!order) return;

  if (target === "PENDING_PAYMENT" || target === "CANCELLED") {
    return;
  }

  if (target === "DELIVERING" && !order.delivery) {
    attachMockDeliveryToOrder(orderId, {
      id: newId("DLV"),
      etaMinutes: 20,
      courier: "Thao V.",
    });
  }

  const notes: Partial<Record<OrderStatus, { service: string; note: string }>> = {
    CONFIRMED: {
      service: "Payment Service",
      note: "[Demo] Manual payment success.",
    },
    DELIVERING: {
      service: "Delivery Service",
      note: "[Demo] Delivery started.",
    },
    DELIVERED: {
      service: "Delivery Service",
      note: "[Demo] Order delivered successfully.",
    },
  };

  const meta = notes[target];
  updateMockOrderStatus(orderId, target, meta?.service ?? "Demo Service", meta?.note);
}
