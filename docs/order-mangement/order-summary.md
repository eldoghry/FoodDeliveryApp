# Sub-Feature: Order Summary

## Description

Provides a summary of the order for the customer.

## Use Cases

- A customer views a summary of their order after placing it.

## Actors

- Customer

## Constraints

- Only the customer who placed the order can view the summary.

## Errors

- Invalid order ID.

## API Design

#### GET /orders/{order_id}/summary

- Description: Retrieve the summary of an order.

- Response:

  ```json
  {
  	"order_id": "string",
  	"total": "number",
  	"status": "string",
  	"item_count": "integer"
  }
  ```
