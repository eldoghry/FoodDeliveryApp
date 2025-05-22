const swaggerSchema = {
	AddItemToCart: {
		type: 'object',
		properties: {
			restaurantId: { type: 'integer', example: 1 },
			itemId: { type: 'integer', example: 1 },
			quantity: { type: 'integer', example: 1 }
		}
	},
	viewCartResponse: {
		type: 'object',
		properties: {
			id: { type: 'integer', description: 'The ID of the cart.', example: 1 },
			customerId: { type: 'integer', description: 'The ID of the customer.', example: 1 },
			restaurant: {
				type: 'object',
				properties: {
					id: { type: 'integer', description: 'The ID of the restaurant.', example: 1 },
					name: { type: 'string', description: 'The name of the restaurant.', example: 'Restaurant 1' }
				}
			},
			items: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						cartId: { type: 'integer', description: 'The ID of the cart.', example: 1 },
						cartItemId: { type: 'integer', description: 'The ID of the cart item.', example: 1 },
						itemId: { type: 'integer', description: 'The ID of the item.', example: 1 },
						itemName: { type: 'string', description: 'The name of the item.', example: 'Item 1' },
						imagePath: { type: 'string', description: 'The path to the image of the item.', example: 'image1.jpg' },
						quantity: { type: 'integer', description: 'The quantity of the item.', example: 2 },
						price: { type: 'number', format: 'float', description: 'The price of the item.', example: 10.00 },
						totalPrice: { type: 'number', format: 'float', description: 'The total price of the item (price * quantity).', example: 20.00 },
						isAvailable: { type: 'boolean', description: 'Whether the item is available.', example: true }
					}
				}
			},
			totalItems: { type: 'integer', description: 'The total number of items in the cart.', example: 2 },
			totalPrice: { type: 'number', format: 'float', description: 'The total price of the cart (sum of totalPrice of all items).', example: 20.00 },
			createdAt: { type: 'string', format: 'date-time', description: 'The creation date of the cart.', example: '2022-01-01T00:00:00.000Z' },
			updatedAt: { type: 'string', format: 'date-time', description: 'The last update date of the cart.', example: '2022-01-01T00:00:00.000Z' }
		}
	},
	UpdateCartItemQuantityBody: {
		type: 'object',
		properties: {
			quantity: { type: 'integer', description: 'The new quantity of the item.', example: 2 }
		}
	},
	CartItemResponse: {
		type: 'object',
		properties: {
			cartItemId: { type: 'integer', description: 'The ID of the cart item.', example: 1 },
			cartId: { type: 'integer', description: 'The ID of the cart.', example: 1 },
			restaurantId: { type: 'integer', description: 'The ID of the restaurant.', example: 1 },
			itemId: { type: 'integer', description: 'The ID of the item.', example: 1 },
			quantity: { type: 'integer', description: 'The quantity of the item.', example: 2 },
			price: { type: 'number', format: 'float', description: 'The price of the item.', example: 10.00 },
			totalPrice: { type: 'number', format: 'float', description: 'The total price of the item (price * quantity).', example: 20.00 },
			createdAt: { type: 'string', format: 'date-time', description: 'The creation date of the cart item.', example: '2022-01-01T00:00:00.000Z' },
			updatedAt: { type: 'string', format: 'date-time', description: 'The last update date of the cart item.', example: '2022-01-01T00:00:00.000Z' }
		}
	}

};

export default swaggerSchema;
