# Sub-Feature: Place Order

## Description

Allows customers to place food orders from a restaurant. The system validates the order, processes payment, and confirms the order.

## Use Cases

- A customer selects items from the menu, chooses a payment method (e.g., credit card, cash on delivery), and specifies a delivery address to place an order.

- System validates item availability and pricing.

- System processes payment (if applicable).

- System confirms the order and notifies the restaurant.

## Actors

- Customer

- Restaurant

- Payment Gateway

## Constraints

- Customer must be logged in.
- Delivery address must be within the restaurant’s delivery zone.
- Payment method must be supported by the system.

## Flow Chart

![place_order.flowchart](https://drive.google.com/uc?export=view&id=1fojf2IHsmeRb7Y_g3arCyOgatxe3TSbj)

## Errors

- Invalid delivery address (e.g., outside delivery zone).
- Payment method failure (e.g., declined credit card).
- Restaurant out of stock for selected items.

## API Design

#### POST /orders

- Description: Create a new order.
- Request Body:

  ```json
  {
  	"customer_id": "string",
  	"restaurant_id": "string",
  	"items": [
  		{
  			"item_id": "string",
  			"quantity": "integer"
  		}
  	],
  	"payment_method": "string", // e.g., "credit_card", "cash_on_delivery"
  	"delivery_address": {
  		"street": "string",
  		"city": "string",
  		"zip_code": "string"
  	}
  }
  ```

- Request Body:
  ```json
  {
  	"order_id": "ORD-1001",
  	"status": "CONFIRMED",
  	"estimated_time": "30 mins"
  }
  ```
