# Sub-Feature: Restaurants Order History

## Description

Allows restaurants to view their order history.

## Use Cases

- A restaurant checks past orders to analyze sales trends.

## Actors

- Restaurant

## Constraints

- Only the restaurant can view its own order history.

## Errors

- No orders found for the restaurant.

## API Design

#### GET /restaurants/{restaurant_id}/orders

- Description: Retrieve order history for a restaurant.

- Response 200:

  ```json
  [
  	{
  		"order_id": "string",
  		"customer_id": "string",
  		"status": "string",
  		"total": "number"
  	}
  ]
  ```
