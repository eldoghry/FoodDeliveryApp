# Sub-Feature: Get Restaurant by Id

## Description

get full details for restaurant by id.

## Actors

- Customer
<!--

## Constraint

- -->

## API Design

#### GET /api/v1/restaurants/${restaurantId}

- Authorization: Bearer {token}

- Content-Type: application/json
- Request
- Response: 200 OK

```json
{
	"success": true,
	"data": {
		"restaurantId": "number",
		"name": "string",
		"description": "string",
		"logoUrl": "string",
		"bannerUrl": "string",
		"cuisineTypes": ["string"],
		"rating": "number",
		"reviewCount": "number",
		"deliveryFee": "number",
		"minimumOrder": "number",
		"estimatedDeliveryTime": "number",
		"distance": "number",
		"isActive": true,
		"isOpen": true,
		"address": {
			"street": "string",
			"city": "string",
			"area": "string"
		},
		"menu": {
			// menu data
			"categories": [
				// category data
				"items": [
				{
					// items data
				}
			]
			]
		}
	}
}
```
