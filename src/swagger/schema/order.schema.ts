const swaggerSchema = {
    UpdateOrderStatusBody: {
        type: 'object',
        properties: {
            status: {
                type: 'string',
                description: 'The new status of the order.',
                enum: ['initiated', 'pending', 'confirmed', 'onTheWay', 'canceled', 'delivered', 'failed'],
                example: 'delivered'
            }
        }
    },
    OrderStatusLog: {
        type: 'object',
        properties: {
            orderId: { type: 'integer', description: 'The ID of the order.', example: 1 },
            status: { type: 'string', description: 'The new status of the order.', enum: ['initiated', 'pending', 'confirmed', 'onTheWay', 'canceled', 'delivered', 'failed'], example: 'delivered' },
            changeBy: { type: 'string', description: 'The actor who changed the order status.', enum: ['system', 'restaurant', 'payment'], example: 'restaurant' },
            createdAt: { type: 'string', description: 'The timestamp when the order status was changed.', example: '2022-01-01T00:00:00.000Z' },
        }
    },
    OrderItem: {
        type: 'object',
        properties: {
            orderId: { type: 'integer', description: 'The ID of the order.', example: 1 },
            itemId: { type: 'integer', description: 'The ID of the item.', example: 1 },
            quantity: { type: 'integer', description: 'The quantity of the item.', example: 2 },
            price: { type: 'number', description: 'The price of the item.', example: 10.00 },
            totalPrice: { type: 'number', description: 'The total price of the item.', example: 20.00 },
        }
    },
    Order: {
        type: 'object',
        properties: {
            orderId: { type: 'integer', description: 'The ID of the order.', example: 1 },
            restaurantId: { type: 'integer', description: 'The ID of the restaurant.', example: 1 },
            customerId: { type: 'integer', description: 'The ID of the customer.', example: 1 },
            deliveryAddressId: { type: 'integer', description: 'The ID of the delivery address.', example: 1 },
            status: { type: 'string', description: 'The status of the order.', enum: ['initiated', 'pending', 'confirmed', 'onTheWay', 'canceled', 'delivered', 'failed'], example: 'delivered' },
            customerInstructions: { type: 'string', description: 'The instructions provided by the customer.', example: 'no onions' },
            serviceFees: { type: 'number', description: 'The service fees for the order.', example: 10.00 },
            deliveryFees: { type: 'number', description: 'The delivery fees for the order.', example: 5.00 },
            totalAmount: { type: 'number', description: 'The total amount of the order.', example: 15.00 },
            placedAt: { type: 'string', description: 'The timestamp when the order was placed.', example: '2022-01-01T00:00:00.000Z' },
            deliveredAt: { type: 'string', description: 'The timestamp when the order was delivered.', example: '2022-01-01T00:00:00.000Z' },
            cancellationInfo: {
                type: 'object',
                properties: {
                    cancelledBy: { type: 'string', description: 'The actor who cancelled the order.', enum: ['system', 'restaurant', 'payment'], example: 'restaurant' },
                    reason: { type: 'string', description: 'The reason for cancelling the order.', example: 'item not available' },
                    cancelledAt: { type: 'string', description: 'The timestamp when the order was cancelled.', example: '2022-01-01T00:00:00.000Z' }
                }
            },
        }
    },
    OrderResponse: {
        allOf: [
            { $ref: '#/components/schemas/Order' },
            {
                properties: {
                    restaurant: { $ref: '#/components/schemas/Restaurant' },
                    customer: { $ref: '#/components/schemas/Customer' },
                    deliveryAddress: { $ref: '#/components/schemas/Address' },
                    orderItems: {
                        type: 'array', 
                        description: 'The items in the order.',
                        items: { $ref: '#/components/schemas/OrderItem' }
                    }, 
                    orderStatusLogs: {
                        type: 'array',
                        description: 'The status logs of the order.',
                        items: { $ref: '#/components/schemas/OrderStatusLog' }
                    },
                    createdAt: { type: 'string', description: 'The timestamp when the order was created.', example: '2022-01-01T00:00:00.000Z' },
                    updatedAt: { type: 'string', description: 'The timestamp when the order was updated.', example: '2022-01-01T00:00:00.000Z' },
                }
            }
        ]
    }
}

export default swaggerSchema;
