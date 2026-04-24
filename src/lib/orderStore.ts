// Simulated microservices: Order, Payment, Delivery
// In-memory store with pub/sub. State machine drives the order lifecycle.
import { useSyncExternalStore } from "react";
import type { MenuItem } from "./menu";

// 1. Định nghĩa lại các Status cần thiết
export type OrderStatus =
    | "PENDING_PAYMENT"
    | "CONFIRMED"
    | "DELIVERING"
    | "DELIVERED"
    | "CANCELLED";

export type PaymentMethod = "card" | "ewallet" | "cod";
export type CartLine = { item: MenuItem; qty: number };

export type Order = {
    id: string;
    createdAt: number;
    customer: { name: string; phone: string; address: string };
    lines: CartLine[];
    total: number;
    paymentMethod: PaymentMethod;
    status: OrderStatus;
    payment?: { status: "PENDING" | "SUCCESS" | "FAILED"; txnId?: string };
    delivery?: { id: string; etaMinutes: number; courier: string };
    history: { status: OrderStatus; at: number; service: string; note?: string }[];
};

type Listener = (orders: Record<string, Order>) => void;
const orders: Record<string, Order> = {};
const listeners = new Set<Listener>();

function emit() {
    for (const l of listeners) l({ ...orders });
}

// FIX: Thêm hàm updateOrder để xử lý cập nhật trạng thái đơn hàng
function updateOrder(id: string, patch: Partial<Order>) {
    const order = orders[id];
    if (!order) return;
    Object.assign(order, patch);
    emit();
}

export function subscribe(l: Listener) {
    listeners.add(l);
    l({ ...orders });
    return () => {
        listeners.delete(l);
    };
}

export function getOrder(id: string): Order | undefined {
    return orders[id];
}

function pushHistory(o: Order, status: OrderStatus, service: string, note?: string) {
    o.status = status;
    o.history.push({ status, at: Date.now(), service, note });
}

function newId(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// ---- Order Service ----
export function createOrder(input: {
    customer: Order["customer"];
    lines: CartLine[];
    paymentMethod: PaymentMethod;
}): Order {
    const total = input.lines.reduce((s, l) => s + l.item.price * l.qty, 0);
    const id = newId("ORD");
    const order: Order = {
        id,
        createdAt: Date.now(),
        customer: input.customer,
        lines: input.lines,
        total,
        paymentMethod: input.paymentMethod,
        status: "PENDING_PAYMENT",
        payment: { status: "PENDING" },
        history: [],
    };
    pushHistory(order, "PENDING_PAYMENT", "Order Service", "Order created, awaiting payment.");
    orders[id] = order;
    emit();
    return order;
}

// ---- Payment Service ----
export async function processPayment(orderId: string, outcome: "SUCCESS" | "FAILED") {
    const order = orders[orderId];
    if (!order) return;

    await new Promise(r => setTimeout(r, 1500));

    if (outcome === "FAILED") {
        updateOrder(orderId, {
            status: "CANCELLED",
            history: [...order.history, { status: "CANCELLED", service: "Payment Service", at: Date.now(), note: "Payment failed: Insufficient balance." }]
        });
        return;
    }

    // Thanh toán thành công -> CONFIRMED (Trạng thái Paid trên UI)
    updateOrder(orderId, {
        status: "CONFIRMED",
        history: [...order.history, { status: "CONFIRMED", service: "Payment Service", at: Date.now(), note: "Payment successful. Order confirmed." }]
    });

    await new Promise(r => setTimeout(r, 2000));

    // Tự động gọi Delivery Service sau khi thanh toán thành công
    triggerDelivery(orderId);
}

// ---- Delivery Service ----
async function triggerDelivery(orderId: string) {
    const o = orders[orderId];
    if (!o || o.status === "CANCELLED") return;

    // Chuyển sang bước Shipping
    const couriers = ["Minh N.", "Lan P.", "Hùng T.", "Thảo V."];
    const deliveryData = {
        id: newId("DLV"),
        etaMinutes: 25,
        courier: couriers[Math.floor(Math.random() * couriers.length)],
    };

    updateOrder(orderId, {
        status: "DELIVERING",
        delivery: deliveryData,
        history: [...o.history, {
            status: "DELIVERING",
            service: "Delivery Service",
            at: Date.now(),
            note: `Courier ${deliveryData.courier} assigned. Delivery in progress.`
        }]
    });
}

// ---- Manual demo triggers ----
export function manualAdvance(orderId: string, target: OrderStatus) {
    const o = orders[orderId];
    if (!o) return;

    const notes: Partial<Record<OrderStatus, { service: string; note: string }>> = {
        CONFIRMED: { service: "Payment Service", note: "[Demo] Manual payment success." },
        DELIVERING: { service: "Delivery Service", note: "[Demo] Manual shipping start." },
        DELIVERED: { service: "Delivery Service", note: "[Demo] Order delivered successfully." },
    };

    const meta = notes[target];
    if (target === "DELIVERING" && !o.delivery) {
        o.delivery = { id: newId("DLV"), etaMinutes: 20, courier: "Thảo V." };
    }

    pushHistory(o, target, meta?.service ?? "Demo Service", meta?.note);
    emit();
}

export function manualPayment(orderId: string, outcome: "SUCCESS" | "FAILED") {
    return processPayment(orderId, outcome);
}

// 2. Luồng hiển thị rút gọn còn 4 bước
export const STATUS_FLOW: OrderStatus[] = [
    "PENDING_PAYMENT",
    "CONFIRMED",
    "DELIVERING",
    "DELIVERED"
];

// 3. Tên hiển thị thân thiện
export const STATUS_LABEL: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "Pending",
    CONFIRMED: "Paid",
    DELIVERING: "Shipping",
    DELIVERED: "Success",
    CANCELLED: "Cancelled"
};