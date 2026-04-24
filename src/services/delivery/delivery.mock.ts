import { emitOrders, mockDb } from "@/mocks/db";
import { attachMockDeliveryToOrder, updateMockOrderStatus } from "@/services/order/order.mock";

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function triggerMockDelivery(orderId: string) {
  const order = mockDb.orders[orderId];
  if (!order || order.status === "CANCELLED") return;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const couriers = ["Minh N.", "Lan P.", "Hung T.", "Thao V."];
  const delivery = {
    orderId,
    id: newId("DLV"),
    etaMinutes: 25,
    courier: couriers[Math.floor(Math.random() * couriers.length)],
    status: "DELIVERING" as const,
  };

  mockDb.deliveries[orderId] = delivery;
  attachMockDeliveryToOrder(orderId, {
    id: delivery.id,
    etaMinutes: delivery.etaMinutes,
    courier: delivery.courier,
  });

  updateMockOrderStatus(
    orderId,
    "DELIVERING",
    "Delivery Service",
    `Courier ${delivery.courier} assigned. Delivery in progress.`,
  );
  emitOrders();
}

export function getMockDelivery(orderId: string) {
  return mockDb.deliveries[orderId];
}

export function markMockDeliveryDelivered(orderId: string) {
  const delivery = mockDb.deliveries[orderId];
  if (!delivery) return;

  delivery.status = "DELIVERED";
  updateMockOrderStatus(orderId, "DELIVERED", "Delivery Service", "Order delivered successfully.");
}
