import { appConfig, isLiveApiMode } from "@/shared/config";
import { httpJson } from "@/shared/http";
import type { Payment, PaymentStatus } from "@/shared/order.types";
import { getMockPayment, processMockPayment } from "./payment.mock";

export async function processPayment(
  orderId: string,
  outcome: Extract<PaymentStatus, "SUCCESS" | "FAILED">,
) {
  if (!isLiveApiMode()) {
    return processMockPayment(orderId, outcome);
  }

  return httpJson<Payment>(`${appConfig.paymentServiceUrl}/payments`, {
    method: "POST",
    body: JSON.stringify({ orderId, outcome }),
  });
}

export async function getPayment(orderId: string) {
  if (!isLiveApiMode()) {
    return getMockPayment(orderId);
  }

  return httpJson<Payment>(`${appConfig.paymentServiceUrl}/payments/${orderId}`);
}

export async function manualPayment(
  orderId: string,
  outcome: Extract<PaymentStatus, "SUCCESS" | "FAILED">,
) {
  return processPayment(orderId, outcome);
}
