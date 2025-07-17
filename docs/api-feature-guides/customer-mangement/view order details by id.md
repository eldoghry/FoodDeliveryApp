# Sub-Feature: View Orders History

## Description

user Retrieve detailed orders

## Actors

- Customer
- Restaurant User

## Constraints

- Only the customer who placed the order can view the details.

## Errors

- Invalid order ID.

## API Design

#### GET /api/v1/customer/orders/{orderId}

- Authorization: Bearer {token}
- Response: 200 OK

```json
{
	"success": true,
	"data": {
		"orderId": "number",
		"orderNumber": "string",
		"status": "string",
		"restaurant": {
			"restaurantId": "number",
			"name": "string",
			"phone": "string",
			"address": "string"
		},
		"deliveryAddress": {
			"street": "string",
			"city": "string",
			"coordinates": {
				"lat": "number",
				"lng": "number"
			}
		},
		"items": [
			{
				"itemId": "number",
				"name": "string",
				"quantity": "number",
				"price": "number",
				"modifications": ["string"]
			}
		],
		"payment": {
			"method": "string",
			"amount": "number",
			"status": "string"
		},
		"timeline": [
			{
				"status": "string",
				"timestamp": "datetime"
			}
		],
		"createdAt": "datetime"
	}
}
```
