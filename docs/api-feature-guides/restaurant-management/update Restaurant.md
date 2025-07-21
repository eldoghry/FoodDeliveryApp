# Sub-Feature: update Restaurant

## Description

System creates restaurant profile with pending approval status

## Actors

- Restaurant Owner

## Constraint

- restaurant owner can do this use case

## API Design

#### PUT /api/v1/restaurants/{restaurantId}

- Authorization: Bearer {token}

- Content-Type: application/json
- Request

```json
{
	"name": "string",
	"description": "string",
	"phone": "string",
	"logoUrl": "string",
	"bannerUrl": "string",
	"cuisineTypes": ["string"]
	// "operatingHours": {
	// 	"monday": { "open": "09:00", "close": "22:00", "isOpen": true }
	// }
}
```

- Response: 200 OK

```json
{
	"success": true,
	"message": "Restaurant updated successfully",
	"data": {
		"restaurantId": "number",
		"name": "string",
		"updatedAt": "datetime"
	}
}
```
