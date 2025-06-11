# Sub-Feature: Get Restaurant Recommendations

## Description

get list of Restaurant Recommendations

## Actors

- customer

## Constraint

-

## API Design

#### GET /api/v1/restaurants/top-rated

- Authorization: Bearer {token}

- Content-Type: application/json
- Request
- Query Parameters:

  - limit: number (default: 15)
  - type: string (personal|popular|nearby|similar)

- Response: 200 OK

```json
{
  "success": true,
  "data": {
    "personal": [
      {
        "restaurantId": "number",
        "name": "string",
        "logoUrl": "string",
        "rating": "number",
        "cuisineTypes": ["string"],
        "reason": "Based on your recent orders"
      }
    ],
    "popular": [...],
    "nearby": [...],
    "similar": [...]
  }
}
```
