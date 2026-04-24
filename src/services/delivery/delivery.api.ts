import { appConfig, isLiveApiMode } from "@/shared/config";
import { httpJson } from "@/shared/http";
import type { Delivery } from "@/shared/order.types";
import { getMockDelivery, markMockDeliveryDelivered, triggerMockDelivery } from "./delivery.mock";

export async function triggerDelivery(orderId: string) {
  if (!isLiveApiMode()) {
    return triggerMockDelivery(orderId);
  }

  return httpJson<Delivery>(`${appConfig.deliveryServiceUrl}/deliveries`, {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

export async function getDelivery(orderId: string) {
  if (!isLiveApiMode()) {
    return getMockDelivery(orderId);
  }

  return httpJson<Delivery>(`${appConfig.deliveryServiceUrl}/deliveries/${orderId}`);
}

export async function markDelivered(orderId: string) {
  if (!isLiveApiMode()) {
    return markMockDeliveryDelivered(orderId);
  }

  await httpJson<void>(`${appConfig.deliveryServiceUrl}/deliveries/${orderId}/delivered`, {
    method: "PATCH",
  });
}
