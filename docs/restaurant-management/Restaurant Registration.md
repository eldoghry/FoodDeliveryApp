# Sub-Feature: Restaurant Registration

## Description

System creates restaurant profile with pending approval status

## Actors

- Restaurant Owner

## Constraint

-

## API Design

#### POST /api/v1/restaurants

- Authorization: Bearer {token}

- Content-Type: application/json
- Request

```json
{
	"name": "string",
	"description": "string",
	"phone": "string",
	"email": "string",
	"commercialRegistrationNumber": "string",
	"vatNumber": "string",
	"cuisineTypes": ["string"],
	"address": {
		"street": "string",
		"building": "string",
		"city": "string",
		"area": "string",
		"coordinates": {
			"lat": "number",
			"lng": "number"
		}
	},
	"operatingHours": {
		"monday": { "open": "09:00", "close": "22:00", "isOpen": true },
		"tuesday": { "open": "09:00", "close": "22:00", "isOpen": true },
		"wednesday": { "open": "09:00", "close": "22:00", "isOpen": true },
		"thursday": { "open": "09:00", "close": "22:00", "isOpen": true },
		"friday": { "open": "09:00", "close": "22:00", "isOpen": true },
		"saturday": { "open": "09:00", "close": "22:00", "isOpen": true },
		"sunday": { "open": "09:00", "close": "22:00", "isOpen": false }
	}
}
```

- Response: 201 OK

```json
{
	"success": true,
	"message": "Restaurant registered successfully. Pending approval.",
	"data": {
		"restaurantId": "number",
		"name": "string",
		"status": "pending_approval",
		"submittedAt": "datetime"
	}
}
```
