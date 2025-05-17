const swaggerSchema = {
	AddItemToCart: {
		type: 'object',
		properties: {
			restaurantId: { type: 'integer', example: 1 },
			itemId: { type: 'integer', example: 1 },
			quantity: { type: 'integer', example: 1 }
		}
	}
};

export default swaggerSchema;
