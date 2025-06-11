# Sub-Feature: List Restaurant

## Description

get list of restaurants

## Actors

- customer

## Constraint

-

## API Design

#### GET /api/v1/restaurants

- Authorization: Bearer {token}

- Content-Type: application/json
- Request
- Query Parameters:

  - page: number (default: 1)
  - limit: number (default: 20)
  - search: string (optional)
  - cuisine: string (optional)
  - location: string (optional)
  - rating: number (optional)
  - status: string (optional)
  - sort: string (name|rating|distance|created_at)
  - order: string (asc|desc)

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
		],
		"pagination": {
			"page": "number",
			"limit": "number",
			"total": "number",
			"totalPages": "number"
		}
	}
}
```
