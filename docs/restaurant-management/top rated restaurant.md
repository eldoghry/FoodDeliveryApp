# Sub-Feature: Top Rated Restaurant

## Description

get list of top rated restaurant

## Actors

- customer

## Constraint

-

## API Design

#### GET /api/v1/restaurants/top-rated

- Authorization: Bearer {token}

- Content-Type: application/json
- Request
- Query Parameters:

  - limit: number (default: 10)
  - cuisine: string (optional)
  - location: string (optional)

- Response: 200 OK

```json
{
	"success": true,
	"data": [
		{
			"restaurantId": "number",
			"name": "string",
			"logoUrl": "string",
			"rating": "number",
			"reviewCount": "number",
			"cuisineTypes": ["string"],
			"rank": "number"
		}
	]
}
```
