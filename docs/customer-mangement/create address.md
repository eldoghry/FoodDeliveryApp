# Sub-Feature: create customer address

## Description

Customer create new addresses

## Actors

- Customer

## Constraint

- Maximum 10 saved addresses per customer

## API Design

#### POST /api/v1/customer/addresses

- Authorization: Bearer {token}

- Content-Type: application/json
- Request

```json
{
	"label": "string",
	"street": "string",
	"building": "string",
	"floor": "string",
	"apartment": "string",
	"city": "string",
	"area": "string",
	"coordinates": {
		"lat": "number",
		"lng": "number"
	},
	"isDefault": false
}
```

- Response: 201 OK

```json
{
	"success": true,
	"message": "Address added successfully",
	"data": {
		"addressId": "number",
		"label": "string",
		"street": "string",
		"isDefault": false
	}
}
```
