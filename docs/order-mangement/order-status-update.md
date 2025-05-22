# Sub-Feature: Update Orders Status

## Description

Allows the restaurant to update the order status (e.g., "placed," "preparing," "delivered").

## Use Cases

- Restaurant updates the status to "preparing", "ready" after accepting the order.

## Actors

- Admin
- Restaurant

## Constraints

- Only the restaurant can update the status..

- Status transitions must follow a valid sequence (e.g., placed → preparing → out for delivery → delivered).

## Flow Chart

![place_status_update.flowchart]()

## Errors

- Invalid status transition (e.g., from "delivered" back to "preparing").

- Invalid order ID.

## API Design

#### PATCH /orders/{order_id}/status

- Description: Update the status of an order.

- Request Body:

  ```json
  {
  	"status": "string" // e.g., "preparing", "delivered"
  }
  ```

- Response 200:

  ```json
  {
  	"order_id": "string",
  	"status": "preparing"
  }
  ```

- Response 400:
  ```json
  {
  	"error": "Invalid status transition"
  }
  ```
