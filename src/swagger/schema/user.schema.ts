const swaggerSchema = {
	User: {
		type: 'object',
		properties: {
			id: { type: 'integer' },
			firstName: { type: 'string' },
			lastName: { type: 'string' },
			email: { type: 'string' }
		}
	},
	CreateUser: {
		type: 'object',
		required: ['firstName', 'lastName', 'email'],
		properties: {
			firstName: { type: 'string' },
			lastName: { type: 'string' },
			email: { type: 'string' }
		}
	}
};

export default swaggerSchema;
