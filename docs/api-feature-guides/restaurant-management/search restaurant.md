# Sub-Feature: Search Restaurant

## Description

search restaurant

## Actors

- customer

## Constraint

-

## API Design

#### GET /api/v1/restaurants/search

- Authorization: Bearer {token}

- Content-Type: application/json
- Request
- Query Parameters:

  - q: string (search query)
  - radius: number (optional, in km)
  - cuisine: string (optional)
  - rating: number (optional)

- Response: 200 OK

```json
{
	"success": true,
	"data": {
		"restaurants": [
			{
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
				}
			}
		]
	}
}
```
