const swaggerSchema = {
	messageResponse: {
		type: 'object',
		properties: {
			requestTime: { type: 'integer', example: new Date().toISOString() },
			status: { type: 'string', example: 'success' },
			message: { type: 'integer', example: 'some success message' }
		}
	}
};

export default swaggerSchema;
