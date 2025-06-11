# Sub-Feature: toggle restaurant status

## Description

update restaurant status

## Actors

- Restaurant Owner

## Constraint

-

## API Design

#### PATCH /api/v1/restaurants/{restaurantId}/status

- Authorization: Bearer {token}

- Content-Type: application/json
- Request

```json
{
	"isActive": true,
	"reason": "string" // optional
}
```

- Response: 200 OK

```json
{
	"success": true,
	"message": "Restaurant status updated successfully",
	"data": {
		"restaurantId": "number",
		"isActive": true,
		"statusChangedAt": "datetime"
	}
}
```
