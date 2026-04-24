import { emitOrders, mockDb } from "@/mocks/db";
import { updateMockOrderStatus } from "@/services/order/order.mock";
import type { PaymentStatus } from "@/shared/order.types";

export async function processMockPayment(
  orderId: string,
  outcome: Extract<PaymentStatus, "SUCCESS" | "FAILED">,
) {
  const order = mockDb.orders[orderId];
  if (!order) return;

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const payment = {
    orderId,
    method: order.paymentMethod,
    status: outcome,
    txnId: outcome === "SUCCESS" ? `TXN-${Date.now()}` : undefined,
  } as const;

  mockDb.payments[orderId] = payment;
  order.payment = payment;

  if (outcome === "FAILED") {
    updateMockOrderStatus(
      orderId,
      "CANCELLED",
      "Payment Service",
      "Payment failed: insufficient balance.",
    );
    return;
  }

  updateMockOrderStatus(
    orderId,
    "CONFIRMED",
    "Payment Service",
    "Payment successful. Order confirmed.",
  );
  emitOrders();
}

export function getMockPayment(orderId: string) {
  return mockDb.payments[orderId];
}
