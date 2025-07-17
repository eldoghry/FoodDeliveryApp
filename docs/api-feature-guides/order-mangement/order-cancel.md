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

- Cancellation is only allowed within a specific time window (e.g., 5 minutes after placing) for customers.
- Restaurant can cancel any pending order at any time.
- Only valid orders in "pending" status can be canceled.

## Errors

- Order already in progress.
- Invalid order id.
- Order status is payment failed

## API Design

#### POST /orders/cancel

- Description: Cancel pending order.

- Request Body:

  ```json
  {
  	"orderId": "orr-1",
  	"reason": "out of stock"
  }
  ```

- Response Body:
  ```json
  {
  	"orderId": "orr-1",
  	"status": "CANCELLED",
  	"refundStatus": "PENDING"
  }
  ```
