# Sub-Feature: View Orders History

## Description

user Retrieve list of detailed orders with pagination.

## Flow

1. Customer requests order history
2. System retrieves orders with status, date, restaurant, items
3. System returns paginated results

## Actors

- Customer
- Restaurant User

## Constraints

- Only the customer who placed the order can view the details.

## API Design

#### GET /api/v1/customer/orders

- Description: Retrieve list of customer orders.
- Authorization: Bearer {token}
- Query Parameters:

  - page: number (default: 1)
  - limit: number (default: 10)
  - status: string (optional)
  - restaurant_id: number (optional)
  - date_from: date (optional)
  - date_to: date (optional)

- Response: 200 OK

```json
{
	"success": true,
	"data": {
		"orders": [
			{
				"orderId": "number",
				"orderNumber": "string",
				"restaurant": {
					"restaurantId": "number",
					"name": "string",
					"logoUrl": "string"
				},
				"status": "string",
				"total": "number",
				"items": [
					{
						"itemId": "number",
						"name": "string",
						"quantity": "number",
						"price": "number"
					}
				],
				"createdAt": "datetime"
			}
		],
		"pagination": {
			"page": "number",
			"limit": "number",
			"total": "number",
			"totalPages": "number"
		}
	}
}
```
