# Sub-Feature: Canceled Orders by Customers or Restaurants

## Description

Allows customers or restaurants to cancel an order before it is prepared.

## Use Cases

- A customer cancels an order due to a change of mind.
- A restaurant cancels an order due to unavailability of items..

## Actors

- Customer

- Restaurant

## Constraints

- Cancellation is only allowed within a specific time window (e.g., 5 minutes after placing).
-
- Only orders in "pending" status can be canceled.

## Flow Chart

![place_cancel.flowchart]()

## Errors

- Order already in progress.

- Refund processing failure.

## API Design

#### POST /orders/{order_id}/cancel

- Description: Cancel pending order.

- Request Body:
  ```json
  {
  	"orderId": "orr-1",
  	"status": "CANCELLED",
  	"refundStatus": "PENDING"
  }
  ```
