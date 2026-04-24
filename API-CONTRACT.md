# API Contract

This document defines the recommended service contract for the frontend and backend teams.

## Service Summary

| Service | Base URL | Responsibility |
| --- | --- | --- |
| Order Service | `http://localhost:8081` | Create and manage orders |
| Payment Service | `http://localhost:8082` | Handle payment processing |
| Delivery Service | `http://localhost:8083` | Handle shipping and delivery updates |

## Shared Domain Types

### Order Status

```text
PENDING_PAYMENT
CONFIRMED
DELIVERING
DELIVERED
CANCELLED
```

### Payment Method

```text
card
ewallet
cod
```

### Payment Status

```text
PENDING
SUCCESS
FAILED
```

## 1. Order Service

Base URL:

```text
http://localhost:8081
```

### `POST /orders`

Create a new order.

Request body:

```json
{
  "customer": {
    "name": "Nguyen Van A",
    "phone": "0900000000",
    "address": "123 Le Loi, District 1"
  },
  "lines": [
    {
      "item": {
        "id": "mon-1",
        "name": "Salt Baked Chicken",
        "price": 250,
        "image": "https://example.com/item.jpg"
      },
      "qty": 2
    }
  ],
  "paymentMethod": "card"
}
```

Success response:

```json
{
  "id": "ORD-ABC123",
  "createdAt": 1710000000000,
  "customer": {
    "name": "Nguyen Van A",
    "phone": "0900000000",
    "address": "123 Le Loi, District 1"
  },
  "lines": [
    {
      "item": {
        "id": "mon-1",
        "name": "Salt Baked Chicken",
        "price": 250,
        "image": "https://example.com/item.jpg"
      },
      "qty": 2
    }
  ],
  "total": 500,
  "paymentMethod": "card",
  "status": "PENDING_PAYMENT",
  "payment": {
    "orderId": "ORD-ABC123",
    "method": "card",
    "status": "PENDING"
  },
  "history": [
    {
      "status": "PENDING_PAYMENT",
      "at": 1710000000000,
      "service": "Order Service",
      "note": "Order created, awaiting payment."
    }
  ]
}
```

### `GET /orders`

Return a list of orders.

Success response:

```json
[
  {
    "id": "ORD-ABC123",
    "createdAt": 1710000000000,
    "customer": {
      "name": "Nguyen Van A",
      "phone": "0900000000",
      "address": "123 Le Loi, District 1"
    },
    "lines": [],
    "total": 500,
    "paymentMethod": "card",
    "status": "CONFIRMED",
    "history": []
  }
]
```

### `GET /orders/:orderId`

Return one order by ID.

Success response:

```json
{
  "id": "ORD-ABC123",
  "createdAt": 1710000000000,
  "customer": {
    "name": "Nguyen Van A",
    "phone": "0900000000",
    "address": "123 Le Loi, District 1"
  },
  "lines": [],
  "total": 500,
  "paymentMethod": "card",
  "status": "DELIVERING",
  "payment": {
    "orderId": "ORD-ABC123",
    "method": "card",
    "status": "SUCCESS",
    "txnId": "TXN-1710000000000"
  },
  "delivery": {
    "id": "DLV-XYZ123",
    "etaMinutes": 25,
    "courier": "Minh N."
  },
  "history": []
}
```

### `PATCH /orders/:orderId/status`

Update order status.

Request body:

```json
{
  "status": "DELIVERED"
}
```

Success response:

```json
{
  "success": true
}
```

## 2. Payment Service

Base URL:

```text
http://localhost:8082
```

### `POST /payments`

Process payment for an order.

Request body:

```json
{
  "orderId": "ORD-ABC123",
  "outcome": "SUCCESS"
}
```

Success response:

```json
{
  "orderId": "ORD-ABC123",
  "method": "card",
  "status": "SUCCESS",
  "txnId": "TXN-1710000000000"
}
```

### `GET /payments/:orderId`

Return payment information by order ID.

Success response:

```json
{
  "orderId": "ORD-ABC123",
  "method": "card",
  "status": "SUCCESS",
  "txnId": "TXN-1710000000000"
}
```

## 3. Delivery Service

Base URL:

```text
http://localhost:8083
```

### `POST /deliveries`

Create a delivery record for an order.

Request body:

```json
{
  "orderId": "ORD-ABC123"
}
```

Success response:

```json
{
  "orderId": "ORD-ABC123",
  "id": "DLV-XYZ123",
  "etaMinutes": 25,
  "courier": "Minh N.",
  "status": "DELIVERING"
}
```

### `GET /deliveries/:orderId`

Return delivery information by order ID.

Success response:

```json
{
  "orderId": "ORD-ABC123",
  "id": "DLV-XYZ123",
  "etaMinutes": 25,
  "courier": "Minh N.",
  "status": "DELIVERING"
}
```

### `PATCH /deliveries/:orderId/delivered`

Mark a delivery as completed.

Success response:

```json
{
  "success": true
}
```

## Integration Notes For Backend Team

- Frontend mode is controlled by `VITE_API_MODE`.
- In `mock` mode, the frontend uses local mock implementations.
- In `live` mode, the frontend calls real services through:
  - [order.api.ts](/D:/ChauNgocThao-Web_FE/src/services/order/order.api.ts)
  - [payment.api.ts](/D:/ChauNgocThao-Web_FE/src/services/payment/payment.api.ts)
  - [delivery.api.ts](/D:/ChauNgocThao-Web_FE/src/services/delivery/delivery.api.ts)

## Integration Notes For Frontend Team

If the backend API differs from this contract, only update the API layer:

- [order.api.ts](/D:/ChauNgocThao-Web_FE/src/services/order/order.api.ts)
- [payment.api.ts](/D:/ChauNgocThao-Web_FE/src/services/payment/payment.api.ts)
- [delivery.api.ts](/D:/ChauNgocThao-Web_FE/src/services/delivery/delivery.api.ts)

Routes and components should remain largely unchanged.
