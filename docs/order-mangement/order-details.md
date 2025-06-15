# Sub-Feature: Order Details

## Description

Provides detailed information about an order.

## Use Cases

- A customer views the detailed breakdown of their order, including items and delivery address.

## Actors

- Customer

## Constraints

- Only the customer who placed the order can view the details.

## Errors

- Invalid order ID.

## API Design

#### GET /orders/{order_id}/details

- Description: Retrieve detailed information about an order.

- Response:

  ```json
  {
  	"order_id": "string",
  	"items": [
  		{
  			"item_id": "string",
  			"name": "string",
  			"quantity": "integer",
  			"price": "number"
  		}
  	],
  	"delivery_address": {
  		"street": "string",
  		"city": "string",
  		"zip_code": "string"
  	},
  	"payment_method": "string",
  	"status": "string",
  	"total": "number"
  }
  ```
