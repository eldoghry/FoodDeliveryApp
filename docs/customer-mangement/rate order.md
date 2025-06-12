# Sub-Feature: Customer rate order

## Description

Customer update new addresses

## Actors

- Customer

## Constraint

- Order must be completed paid and delivered.
- Orders can only be rated within 7 days of completion
- Rating scale: 1-5 stars
- Maximum comment length: 500 characters
- Only one rate per order id

## API Design

#### POST /api/v1/customer/{orderId}/rate

- Authorization: Bearer {token}

- Content-Type: application/json
- Request

```json
{
	"rating": "number", // 1 - 5
	"comment": "string" // optional
}
```

- Response: 201

```json
{
	"success": true,
	"message": "Rating submitted successfully",
	"data": {
		"ratingId": "number",
		"rating": "number",
		"comment": "string"
	}
}
```
