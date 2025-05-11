const swaggerSchema = {
	Product: {
		type: 'object',
		properties: {
			id: { type: 'integer' },
			name: { type: 'string' },
			description: { type: 'string' }
		}
	}
};

export default swaggerSchema;
