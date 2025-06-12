# Sub-Feature: toggle restaurant status

## Description

update restaurant status

## Actors

- Restaurant Owner

## Constraint

- restaurant owner can do this use case.
- restaurant can only be active if it have at least 1 active menu.

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
