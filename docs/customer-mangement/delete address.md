# Sub-Feature: delete customer address

## Description

Customer delete addresses

## Actors

- Customer

## API Design

#### DELETE /api/v1/customer/addresses/{addressId}

- Authorization: Bearer {token}

- Content-Type: application/json

- Response: 200 OK

```json
{
	"success": true,
	"message": "Address deleted successfully"
}
```
