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
    CancelOrderBody: {
        type: 'object',
        properties: {
            reason: {
                type: 'string',
                description: 'The reason for canceling the order.',
                example: 'Customer requested to cancel the order'
            }
        }
    },
    UpdateOrderStatusResponse: {
        type: 'object',
        properties: {
            orderId: { type: 'integer', description: 'The ID of the order.', example: 1 },
            status: { type: 'string', description: 'The new status of the order.', enum: ['initiated', 'pending', 'confirmed', 'onTheWay', 'canceled', 'delivered', 'failed'], example: 'delivered' },
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
            imagePath: { type: 'string', description: 'The image path of the item.', example: 'Item 1' },
            name: { type: 'string', description: 'The name of the item.', example: 'Item 1' },
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
    },
    OrderSummary: {
        type: 'object',
        properties: {
            orderId: { type: 'integer', description: 'The ID of the order.', example: 1 },
            restaurantId: { type: 'integer', description: 'The ID of the restaurant.', example: 1 },
            status: { type: 'string', description: 'The status of the order.', enum: ['initiated', 'pending', 'confirmed', 'onTheWay', 'canceled', 'delivered', 'failed'], example: 'delivered' },
            customerInstructions: { type: 'string', description: 'The instructions provided by the customer.', example: 'no onions' },
            paymentMethod: { type: 'string', description: 'The payment method used for the order.', example: 'Credit Card' },
            placedAt: { type: 'string', description: 'The timestamp when the order was placed.', example: '2022-01-01T00:00:00.000Z' },
            totalItemsPrice: { type: 'number', description: 'The total price of the items in the order.', example: 30.00 },
            serviceFees: { type: 'number', description: 'The service fees for the order.', example: 2.00 },
            deliveryFees: { type: 'number', description: 'The delivery fees for the order.', example: 15.00 },
            totalAmount: { type: 'number', description: 'The total amount of the order.', example: 47.00 },
        }
    },
    canceledStatusData: {
        type: 'object',
        properties: {
            status: { type: 'string', description: 'The status of the order.', enum: ['initiated', 'pending', 'confirmed', 'onTheWay', 'canceled', 'delivered', 'failed'], example: 'canceled' },
            placedAt: { type: 'string', description: 'The timestamp when the order was placed.', example: '2022-01-01T00:00:00.000Z' },
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
    deliveredStatusData: {
        type: 'object',
        properties: {
            status: { type: 'string', description: 'The status of the order.', enum: ['initiated', 'pending', 'confirmed', 'onTheWay', 'canceled', 'delivered', 'failed'], example: 'delivered' },
            placedAt: { type: 'string', description: 'The timestamp when the order was placed.', example: '2022-01-01T00:00:00.000Z' },
            deliveredAt: { type: 'string', description: 'The timestamp when the order was delivered.', example: '2022-01-01T00:00:00.000Z' }
        }
    },
    OrderData: {
        type: 'object',
        properties: {
            orderId: { type: 'integer', description: 'The ID of the order.', example: 1 },
            items: {
                type: 'array',
                description: 'The items in the order.',
                items: { $ref: '#/components/schemas/OrderItem' }
            },
            deliveryAddress: { $ref: '#/components/schemas/Address' },
            customerInstructions: { type: 'string', description: 'The instructions provided by the customer.', example: 'no onions' },
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
            totalItemsPrice: { type: 'number', description: 'The total price of the items in the order.', example: 30.00 },
            deliveryFees: { type: 'number', description: 'The delivery fees for the order.', example: 15.00 },
            serviceFees: { type: 'number', description: 'The service fees for the order.', example: 2.00 },
            totalAmount: { type: 'number', description: 'The total amount of the order.', example: 47.00 },
            paymentMethod: { type: 'string', description: 'The payment method used for the order.', example: 'Credit Card' },
            createdAt: { type: 'string', description: 'The timestamp when the order was created.', example: '2022-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', description: 'The timestamp when the order was updated.', example: '2022-01-01T00:00:00.000Z' },
        },
        oneOf: [{ $ref: '#/components/schemas/canceledStatusData' }, { $ref: '#/components/schemas/deliveredStatusData' }],
    },
    pagination: {
        type: 'object',
        properties: {
            limit: { type: 'integer', description: 'The number of items per page.', example: 10 },
            nextCursor: { type: 'string', description: 'The cursor for the next page.', example: 'nextCursor' },
            hasNextPage: { type: 'boolean', description: 'Whether there is a next page.', example: true },
        }
    },
    CustomerOrderData: {
        allOf: [{ $ref: '#/components/schemas/OrderData' }, {
            type: 'object', properties: {
                restaurant: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'The ID of the restaurant.', example: 1 },
                        name: { type: 'string', description: 'The name of the restaurant.', example: 'John Doe' },
                        location: {
                            type: 'object', properties: {
                                latitude: { type: 'number', description: 'The latitude of the restaurant.', example: 123.456 },
                                longitude: { type: 'number', description: 'The longitude of the restaurant.', example: 123.456 },
                            }
                        },
                        email: { type: 'string', description: 'The email of the restaurant.', example: 'john.doe@example.com' },
                    }
                },
            }
        }]
    },
    RestaurantOrderData: {
        allOf: [{ $ref: '#/components/schemas/OrderData' }, {
            type: 'object', properties: {
                customer: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'The ID of the customer.', example: 1 },
                        name: { type: 'string', description: 'The name of the customer.', example: 'John Doe' },
                        phone: { type: 'string', description: 'The phone number of the customer.', example: '1234567890' },
                    }
                },
            }
        }]
    },
    CustomerOrdersHistory: {
        title: 'Customer Orders History',
        type: 'object',
        properties: {
            data: {
                type: 'array',
                description: 'The orders of the customer.',
                items: { $ref: '#/components/schemas/CustomerOrderData' }
            },
            pagination: { $ref: '#/components/schemas/pagination' },
        }
    },
    RestaurantOrdersHistory: {
        title: 'Restaurant Orders History',
        type: 'object',
        properties: {
            data: {
                type: 'array',
                description: 'The orders of the restaurant.',
                items: { $ref: '#/components/schemas/RestaurantOrderData' }
            },
            pagination: { $ref: '#/components/schemas/pagination' },
        }
    },
    CustomerOrderDetails: {
        title: 'Customer Order Details',
        type: 'object',
        properties: {
            data: { $ref: '#/components/schemas/CustomerOrderData' },
        }
    },
    RestaurantOrderDetails: {
        title: 'Restaurant Order Details',
        type: 'object',
        properties: {
            data: { $ref: '#/components/schemas/RestaurantOrderData' },
        }
    }

}

export default swaggerSchema;
