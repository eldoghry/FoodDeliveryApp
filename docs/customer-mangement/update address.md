# Sub-Feature: update customer address

## Description

Customer update new addresses

## Actors

- Customer
-

## Constraint

- Only 1 address should be active
- only address owner can update his address

## API Design

#### PUT /api/v1/customer/addresses/{addressId}

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
	"isDefault": true
	// ...
}
```

- Response: 200 OK

```json
{
	"success": true,
	"message": "Address updated successfully"
}
```
