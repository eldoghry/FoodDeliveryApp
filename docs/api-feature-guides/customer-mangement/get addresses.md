# Sub-Feature: List customer address

## Description

Customer views saved addresses

## Actors

- Customer

## API Design

#### GET /api/v1/customer/addresses

- Authorization: Bearer {token}
- Response: 200 OK

```json
{
	"success": true,
	"data": [
		{
			"addressId": "number",
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
			"isDefault": true,
			"createdAt": "datetime"
		}
	]
}
```
