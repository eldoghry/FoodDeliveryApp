# Sub-Feature: Deactivate Customer account

## Description

Deactivate Customer account

## Actors

- Customer

## API Design

#### PUT /api/v1/customer/account/deactivate

- Authorization: Bearer {token}

- Content-Type: application/json
- Request

```json
{
	"reason": "string"
}
```

- Response: 200

```json
{
	"success": true,
	"message": "Account deactivated successfully"
}
```
